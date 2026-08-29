"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleStartConversation() {
    sendMessage(locale === "de" ? "Hallo, ich möchte herausfinden, was ich nach der Schule machen soll." : "Hello, I'd like to figure out what to do after school.");
  }

  const showWelcome = messages.length === 0 && !isStreaming;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {showWelcome && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-5xl mb-4">🧭</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {locale === "de" ? "Willkommen bei Pathfinder" : "Welcome to Pathfinder"}
            </h2>
            <p className="text-gray-500 max-w-sm mb-8">
              {locale === "de"
                ? "Ich helfe dir herauszufinden, welcher Weg nach der Schule zu dir passt."
                : "I'll help you discover which path after school suits you best."}
            </p>
            <button
              onClick={handleStartConversation}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {locale === "de" ? "Gespräch starten" : "Start conversation"}
            </button>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {isStreaming && streamingContent && (
          <MessageBubble
            message={{ role: "assistant", content: streamingContent }}
            isStreaming
          />
        )}

        {isStreaming && !streamingContent && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {!showWelcome && (
        <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? t("voiceListening") : t("inputPlaceholder")}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all max-h-32 overflow-y-auto"
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
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"
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
                    : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"
                }`}
              >
                <MicIcon />
              </button>
            )}

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl px-4 py-3 font-medium text-sm transition-colors shrink-0"
            >
              {t("send")}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            {locale === "de"
              ? "Enter zum Senden · Shift+Enter für neue Zeile"
              : "Enter to send · Shift+Enter for new line"}
          </p>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: Message;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-sm text-sm leading-relaxed shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">P</span>
      </div>
      <div
        className={`bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-lg text-sm leading-relaxed text-gray-800 whitespace-pre-wrap ${isStreaming ? "border-indigo-200" : ""}`}
      >
        {message.content}
        {isStreaming && (
          <span className="inline-block w-1 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
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
