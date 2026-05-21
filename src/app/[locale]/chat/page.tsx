"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ChatInterface } from "@/components/ChatInterface";

export default function ChatPage() {
  const t = useTranslations();
  const locale = useLocale();
  const otherLocale = locale === "de" ? "en" : "de";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}`}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label={t("nav.back")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <span className="font-semibold text-gray-900">{t("chat.title")}</span>
        </div>
        <Link
          href={`/${otherLocale}/chat`}
          className="text-xs font-medium text-gray-500 hover:text-gray-800 border border-gray-200 rounded-full px-3 py-1 transition-colors"
        >
          {otherLocale === "de" ? "Deutsch" : "English"}
        </Link>
      </header>

      {/* Chat */}
      <ChatInterface locale={locale as "de" | "en"} />
    </div>
  );
}
