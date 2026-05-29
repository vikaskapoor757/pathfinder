import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChatInterface } from "@/components/ChatInterface";
import { AgeGate } from "@/components/AgeGate";
import { createClient } from "@/lib/supabase/server";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: "de" | "en" = locale === "en" ? "en" : "de";
  const otherLocale = safeLocale === "de" ? "en" : "de";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const t = await getTranslations({ locale: safeLocale, namespace: "chat" });
  const tNav = await getTranslations({ locale: safeLocale, namespace: "nav" });

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={user ? `/${safeLocale}/dashboard` : `/${safeLocale}`}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label={tNav("back")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <span className="font-semibold text-gray-900">{t("title")}</span>
        </div>
        <div className="flex items-center gap-2">
          {!user && (
            <Link
              href={`/${safeLocale}/login`}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 bg-indigo-50 rounded-full px-3 py-1 transition-colors"
            >
              {t("saveCta")}
            </Link>
          )}
          {user && (
            <Link
              href={`/${safeLocale}/dashboard`}
              className="text-xs font-medium text-gray-500 hover:text-gray-800 border border-gray-200 rounded-full px-3 py-1 transition-colors"
            >
              {tNav("dashboard")}
            </Link>
          )}
          <Link
            href={`/${otherLocale}/chat`}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 border border-gray-200 rounded-full px-3 py-1 transition-colors"
          >
            {otherLocale === "de" ? "Deutsch" : "English"}
          </Link>
        </div>
      </header>

      <AgeGate locale={safeLocale}>
        {!user && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-center justify-between gap-3 shrink-0">
            <span>
              <strong>{t("guestBanner")}</strong> {t("guestBannerNote")}
            </span>
            <div className="flex gap-2 shrink-0">
              <Link
                href={`/${safeLocale}/login`}
                className="font-medium underline underline-offset-2 hover:text-amber-900"
              >
                {tNav("login")}
              </Link>
              <Link
                href={`/${safeLocale}/signup`}
                className="font-medium underline underline-offset-2 hover:text-amber-900"
              >
                {tNav("signup")}
              </Link>
            </div>
          </div>
        )}
        <ChatInterface locale={safeLocale} />
      </AgeGate>
    </div>
  );
}
