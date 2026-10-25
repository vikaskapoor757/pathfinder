"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { ChatProgress } from "./ChatProgress";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  locale: "de" | "en";
  initialMessages?: Message[];
  initialConversationId?: string | null;
}

const TTS_STORAGE_KEY = "pf_tts_enabled";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionCtor = new () => any;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Phrases that mean "I want to type my own answer" — chip click focuses the
// textarea instead of auto-sending.
const FREEFORM_MARKERS = new Set([
  "eigene antwort",
  "etwas anderes",
  "etwas eigenes",
  "sonstiges",
  "something else",
  "other",
  "write my own",
]);

// Phrases that mean "give me a different set of suggestions". Clicking this
// chip immediately sends the chip text as a user message — Claude's system
// prompt instructs it to then provide a NEW set of options for the same
// previous question.
const MORE_MARKERS = new Set([
  "andere vorschläge",
  "mehr optionen",
  "weitere optionen",
  "weitere vorschläge",
  "zeig mir andere",
  "more suggestions",
  "other ideas",
  "show me others",
  "more options",
]);

// Known journey phases that match the system-prompt enum and the progress
// bar's translation keys.
const KNOWN_PHASES = new Set([
  "start",
  "warmup",
  "interests",
  "dislikes",
  "character",
  "values",
  "almostThere",
  "recommendations",
]);

// Extracts the leading emoji grapheme from an assistant message, including
// variation selectors (U+FE0F), ZWJ (U+200D) sequences, and skin-tone
// modifiers. Returns the emoji + the rest of the text with it stripped.
function extractLeadingEmoji(text: string): { emoji: string | null; rest: string } {
  const match = text.match(
    /^(\p{Extended_Pictographic}(?:\p{Extended_Pictographic}|️|‍|\p{Emoji_Modifier})*)\s+/u
  );
  if (!match) return { emoji: null, rest: text };
  return { emoji: match[1], rest: text.slice(match[0].length) };
}

// Pulls the `[OPTIONEN: ...]` / `[OPTIONS: ...]` block AND the `[PHASE: ...]`
// marker out of an assistant message, plus extracts the leading emoji.
// Returns the cleaned display text + parsed metadata.
// Handles mid-stream: partially-typed markers at the end are hidden so
// the user doesn't see raw markup flash in and out as tokens arrive.
function parseForDisplay(raw: string): {
  text: string;
  options: string[];
  phase: string | null;
  emoji: string | null;
} {
  let remaining = raw;
  let options: string[] = [];
  let phase: string | null = null;

  // 1. OPTIONS block (always last if present).
  const optComplete = remaining.match(
    /\n*\[OPTIO(?:NEN|NS):\s*([^\]]+)\]\s*$/i
  );
  if (optComplete) {
    options = optComplete[1]
      .split("|")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);
    remaining = remaining.slice(0, optComplete.index).trimEnd();
  } else {
    const optPartial = remaining.match(/\n*\[OPTIO/i);
    if (optPartial) {
      remaining = remaining.slice(0, optPartial.index).trimEnd();
    }
  }

  // 2. PHASE marker (between the text and the options block).
  const phaseComplete = remaining.match(/\n*\[PHASE:\s*([a-zA-Z]+)\]\s*$/i);
  if (phaseComplete) {
    const value = phaseComplete[1];
    if (KNOWN_PHASES.has(value)) {
      phase = value;
    }
    remaining = remaining.slice(0, phaseComplete.index).trimEnd();
  } else {
    const phasePartial = remaining.match(/\n*\[PHASE/i);
    if (phasePartial) {
      remaining = remaining.slice(0, phasePartial.index).trimEnd();
    }
  }

  // 3. Leading emoji — used as the avatar.
  const { emoji, rest } = extractLeadingEmoji(remaining);

  return { text: rest, options, phase, emoji };
}

function isFreeformOption(opt: string): boolean {
  return FREEFORM_MARKERS.has(opt.trim().toLowerCase());
}

function isMoreOption(opt: string): boolean {
  return MORE_MARKERS.has(opt.trim().toLowerCase());
}

// Walks back from `lastIdx` through chains of (user "andere Vorschläge" →
// assistant) pairs and collects ALL options the user has been shown for the
// current question. The user asked for chips to accumulate — the previous
// batch stays selectable alongside each new batch, rather than being replaced.
//
// Deduplicates case-insensitively, preserving first-shown order for content
// chips. Meta chips (`andere Vorschläge`, `eigene Antwort`) are appended once
// at the end regardless of how many rounds have happened.
function aggregateOptions(
  messages: Message[],
  lastIdx: number
): string[] {
  const content: string[] = [];
  const seen = new Set<string>();
  let more: string | null = null;
  let freeform: string | null = null;

  const push = (opt: string) => {
    const key = opt.trim().toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    if (isMoreOption(opt)) {
      more = opt;
    } else if (isFreeformOption(opt)) {
      freeform = opt;
    } else {
      content.push(opt);
    }
  };

  // Collect from the current assistant message, then walk backward through
  // (assistant → user:more) pairs merging each previous assistant's options.
  const batches: string[][] = [];
  let i = lastIdx;
  while (i >= 0 && messages[i]?.role === "assistant") {
    batches.push(parseForDisplay(messages[i].content).options);
    const prevUser = messages[i - 1];
    const prevAssistant = messages[i - 2];
    if (
      prevUser?.role === "user" &&
      isMoreOption(prevUser.content) &&
      prevAssistant?.role === "assistant"
    ) {
      i -= 2;
    } else {
      break;
    }
  }

  // Earliest batch first so chip order feels stable as rounds accumulate.
  for (const batch of batches.reverse()) {
    for (const opt of batch) push(opt);
  }

  return [
    ...content,
    ...(more ? [more] : []),
    ...(freeform ? [freeform] : []),
  ];
}

export function ChatInterface({
  locale,
  initialMessages = [],
  initialConversationId = null,
}: Props) {
  const t = useTranslations("chat");
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice input
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Text-to-speech
  const [ttsSupported, setTtsSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  // Ref mirrors ttsEnabled so async stream-complete handlers read the
  // latest value even if the user toggled during streaming.
  const ttsEnabledRef = useRef(false);

  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognition());
    setTtsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    try {
      const saved = window.localStorage.getItem(TTS_STORAGE_KEY) === "1";
      setTtsEnabled(saved);
      ttsEnabledRef.current = saved;
    } catch {
      // Storage blocked — leave TTS off.
    }
  }, []);

  useEffect(() => {
    ttsEnabledRef.current = ttsEnabled;
  }, [ttsEnabled]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const speakText = useCallback(
    (text: string) => {
      if (!ttsSupported || !text) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale === "de" ? "de-DE" : "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onerror = (event) => {
        // Surface errors so we can see if the browser is silently blocking us.
        console.error("Speech synthesis error:", event);
      };
      window.speechSynthesis.speak(utterance);
    },
    [ttsSupported, locale]
  );

  function toggleTts() {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    ttsEnabledRef.current = next;
    try {
      window.localStorage.setItem(TTS_STORAGE_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
    if (!next) {
      window.speechSynthesis?.cancel();
      return;
    }
    // Speak a short confirmation from within this click handler.
    // Two purposes:
    //  1. Audio feedback so the user knows TTS is on
    //  2. On iOS Safari, this call inside a user gesture unlocks the
    //     speechSynthesis pipeline so subsequent async speak() calls
    //     (fired from the stream-complete handler) actually play.
    if (ttsSupported) {
      speakText(locale === "de" ? "Sprachausgabe an." : "Voice replies on.");
    }
  }

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop?.();
      return;
    }
    const SR = getSpeechRecognition();
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = locale === "de" ? "de-DE" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setIsListening(false);
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return;

    // Stop listening + speaking when the user sends.
    recognitionRef.current?.stop?.();
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }

    const userMessage: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    let newConversationId: string | null = null;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          locale,
          conversationId,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "meta" && parsed.conversationId) {
              newConversationId = parsed.conversationId;
            } else if (typeof parsed.text === "string") {
              fullText += parsed.text;
              setStreamingContent(fullText);
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);

      // Read the ref, not the state — user may have toggled TTS during streaming.
      if (ttsEnabledRef.current && fullText) {
        speakText(fullText);
      }

      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
        window.history.replaceState({}, "", `/${locale}/chat/${newConversationId}`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            locale === "de"
              ? "Es ist ein Fehler aufgetreten. Bitte versuche es erneut."
              : "An error occurred. Please try again.",
        },
      ]);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Only Cmd/Ctrl+Enter sends — plain Enter inserts a newline.
    // Testers reported accidental sends mid-thought with the old behavior.
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleChipClick(option: string) {
    if (isStreaming) return;
    if (isFreeformOption(option)) {
      // User wants to type their own answer — focus the input, don't send.
      textareaRef.current?.focus();
      return;
    }
    if (isMoreOption(option)) {
      // User wants a different set of options — immediately send the chip
      // text as a user message. Claude's system prompt instructs it to
      // respond with a fresh set of OPTIONEN for the previous question.
      sendMessage(option);
      return;
    }
    // Append the option to the input. Supports selecting multiple chips
    // and freely editing before hitting Send. If the chip is already in
    // the input (toggle), remove it.
    setInput((current) => {
      const trimmed = current.trim();
      if (!trimmed) return option;
      // Toggle off if already present
      const parts = trimmed.split(/,\s*/).filter(Boolean);
      const idx = parts.findIndex((p) => p.toLowerCase() === option.toLowerCase());
      if (idx >= 0) {
        parts.splice(idx, 1);
        return parts.join(", ");
      }
      return `${trimmed}, ${option}`;
    });
    textareaRef.current?.focus();
  }

  function handleStartConversation() {
    sendMessage(locale === "de" ? "Hallo, ich möchte herausfinden, was ich nach der Schule machen soll." : "Hello, I'd like to figure out what to do after school.");
  }

  const showWelcome = messages.length === 0 && !isStreaming;
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  // Pull the latest phase marker Claude emitted. During streaming we read
  // the live stream too so the progress bar updates as soon as the marker
  // comes through.
  const latestAssistant = isStreaming
    ? streamingContent
    : [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
  const latestPhase = parseForDisplay(latestAssistant).phase;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {!showWelcome && (
        <ChatProgress userMessageCount={userMessageCount} phase={latestPhase} />
      )}
      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {showWelcome && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Logo variant="mark" className="h-14 w-14 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-stone-200 mb-2">
              {locale === "de" ? "Willkommen bei Pathfinder" : "Welcome to Pathfinder"}
            </h2>
            <p className="text-gray-500 dark:text-stone-400 max-w-sm mb-8">
              {locale === "de"
                ? "Ich helfe dir herauszufinden, welcher Weg nach der Schule zu dir passt."
                : "I'll help you discover which path after school suits you best."}
            </p>
            <button
              onClick={handleStartConversation}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {locale === "de" ? "Gespräch starten" : "Start conversation"}
            </button>
          </div>
        )}

        {messages.map((msg, i) => {
          // Options only show on the most recent assistant message, to prevent
          // scrolling back and re-answering already-answered questions.
          const isLastAssistant =
            msg.role === "assistant" &&
            i === messages.length - 1 &&
            !isStreaming;
          const parsed = parseForDisplay(msg.content);
          // Accumulate chips across "andere Vorschläge" rounds so earlier
          // suggestions stay selectable alongside new ones.
          const options = isLastAssistant ? aggregateOptions(messages, i) : [];
          return (
            <MessageBubble
              key={i}
              message={{ ...msg, content: parsed.text }}
              emoji={parsed.emoji}
              options={options}
              onChipClick={handleChipClick}
              currentInput={isLastAssistant ? input : ""}
            />
          );
        })}

        {isStreaming && streamingContent && (() => {
          const parsed = parseForDisplay(streamingContent);
          return (
            <MessageBubble
              message={{ role: "assistant", content: parsed.text }}
              emoji={parsed.emoji}
              isStreaming
            />
          );
        })()}

        {isStreaming && !streamingContent && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0">
              <Logo variant="mark" className="w-5 h-5" />
            </div>
            <div className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {!showWelcome && (
        <div className="shrink-0 border-t border-gray-100 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 py-3">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? t("voiceListening") : t("inputPlaceholder")}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-stone-700 bg-gray-50 dark:bg-stone-900 text-gray-900 dark:text-stone-100 placeholder:text-gray-400 dark:text-stone-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all max-h-32 overflow-y-auto"
              disabled={isStreaming}
            />

            {ttsSupported && (
              <button
                type="button"
                onClick={toggleTts}
                title={ttsEnabled ? t("voiceOutputOn") : t("voiceOutputOff")}
                aria-label={ttsEnabled ? t("voiceOutputOn") : t("voiceOutputOff")}
                aria-pressed={ttsEnabled}
                className={`rounded-xl p-3 transition-colors shrink-0 border ${
                  ttsEnabled
                    ? "bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300"
                    : "bg-white dark:bg-stone-900 border-gray-200 dark:border-stone-700 text-gray-500 dark:text-stone-400 hover:text-gray-700 dark:text-stone-300"
                }`}
              >
                {ttsEnabled ? (
                  <SpeakerIcon />
                ) : (
                  <SpeakerMutedIcon />
                )}
              </button>
            )}

            {voiceSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={isStreaming}
                title={isListening ? t("voiceListening") : t("voiceInput")}
                aria-label={isListening ? t("voiceListening") : t("voiceInput")}
                aria-pressed={isListening}
                className={`rounded-xl p-3 transition-colors shrink-0 border ${
                  isListening
                    ? "bg-red-500 border-red-500 text-white animate-pulse"
                    : "bg-white dark:bg-stone-900 border-gray-200 dark:border-stone-700 text-gray-500 dark:text-stone-400 hover:text-gray-700 dark:text-stone-300"
                }`}
              >
                <MicIcon />
              </button>
            )}

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 dark:text-stone-500 text-white rounded-xl px-4 py-3 font-medium text-sm transition-colors shrink-0"
            >
              {t("send")}
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-stone-500 text-center mt-2">
            {locale === "de"
              ? "Senden-Button zum Absenden · Enter für neue Zeile · ⌘+Enter sendet"
              : "Click Send to submit · Enter for new line · ⌘+Enter sends"}
          </p>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  isStreaming,
  options = [],
  onChipClick,
  currentInput = "",
  emoji,
}: {
  message: Message;
  isStreaming?: boolean;
  options?: string[];
  onChipClick?: (option: string) => void;
  currentInput?: string;
  emoji?: string | null;
}) {
  // A chip is "selected" if its text appears as a complete comma-separated
  // segment in the current input. Used purely for visual highlighting so
  // the user can see which chips they've already picked.
  const inputParts = currentInput
    .trim()
    .split(/,\s*/)
    .map((p) => p.toLowerCase())
    .filter(Boolean);
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-sm text-sm leading-relaxed shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0">
        {emoji ? (
          <span className="text-lg leading-none" aria-hidden>
            {emoji}
          </span>
        ) : (
          <Logo variant="mark" className="w-5 h-5" />
        )}
      </div>
      <div className="flex flex-col gap-2 max-w-lg min-w-0">
        <div
          className={`bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm text-sm leading-relaxed text-gray-800 dark:text-stone-200 whitespace-pre-wrap ${isStreaming ? "border-blue-200 dark:border-blue-800/60" : ""}`}
        >
          {message.content}
          {isStreaming && (
            <span className="inline-block w-1 h-4 bg-blue-400 ml-0.5 animate-pulse align-middle" />
          )}
        </div>
        {options.length > 0 && onChipClick && (
          <div className="flex flex-wrap gap-2 pl-1">
            {options.map((opt) => {
              const freeform = isFreeformOption(opt);
              const more = isMoreOption(opt);
              const selected =
                !freeform && !more && inputParts.includes(opt.toLowerCase());
              let className =
                "text-sm font-medium rounded-full px-4 py-2 border transition-colors touch-manipulation ";
              if (freeform) {
                className +=
                  "bg-white border-dashed border-stone-300 text-stone-500 hover:text-stone-800 hover:border-stone-400 " +
                  "dark:bg-stone-800 dark:border-stone-600 dark:text-stone-300 dark:hover:text-stone-100 dark:hover:border-stone-500";
              } else if (more) {
                className +=
                  "bg-white border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-400 " +
                  "dark:bg-stone-800 dark:border-stone-600 dark:text-stone-200 dark:hover:text-white dark:hover:border-stone-500";
              } else if (selected) {
                className +=
                  "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 " +
                  "dark:bg-blue-400 dark:border-blue-400 dark:text-stone-950 dark:hover:bg-blue-300";
              } else {
                className +=
                  "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 " +
                  "dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100 dark:hover:bg-blue-800";
              }
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChipClick(opt)}
                  aria-pressed={selected}
                  className={className}
                >
                  {more ? `↻ ${opt}` : opt}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M10 2a3 3 0 00-3 3v5a3 3 0 006 0V5a3 3 0 00-3-3z" />
      <path
        fillRule="evenodd"
        d="M4 10a1 1 0 011-1h.01a1 1 0 010 2H5a1 1 0 01-1-1zm10 0a1 1 0 011-1h.01a1 1 0 010 2H15a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
      <path d="M5.05 8.05a1 1 0 011.414 0 5 5 0 007.072 0 1 1 0 111.414 1.414 7 7 0 01-9.9 0 1 1 0 010-1.414z" />
      <path d="M10 15a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.972 7.972 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.121 2.122a1 1 0 011.414 0A5.983 5.983 0 0116 10a5.984 5.984 0 01-2.05 4.95 1 1 0 11-1.32-1.5A3.984 3.984 0 0014 10a3.983 3.983 0 00-1.464-3.093 1 1 0 010-1.414 1 1 0 011.464 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SpeakerMutedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}
