"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  locale: "de" | "en";
}

export function ChatInterface({ locale }: Props) {
  const t = useTranslations("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, locale }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const { text } = JSON.parse(data);
              fullText += text;
              setStreamingContent(fullText);
            } catch {
              // ignore malformed chunks
            }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fullText },
      ]);
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
              placeholder={t("inputPlaceholder")}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all max-h-32 overflow-y-auto"
              disabled={isStreaming}
            />
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
