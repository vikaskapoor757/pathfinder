import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: "de" | "en" = locale === "en" ? "en" : "de";
  const otherLocale = safeLocale === "de" ? "en" : "de";
  const t = await getTranslations({ locale: safeLocale });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <span className="text-xl font-bold tracking-tight text-indigo-600">
          Pathfinder
        </span>
        <Link
          href={`/${otherLocale}`}
          className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors border border-gray-200 rounded-full px-3 py-1"
        >
          {otherLocale === "de" ? "Deutsch" : "English"}
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            {safeLocale === "de" ? "KI-gestützte Berufsberatung" : "AI-powered career guidance"}
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-4 leading-tight">
            {t("landing.headline")}
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
            {t("landing.subheadline")}
          </p>

          {user ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/${safeLocale}/dashboard`}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base px-6 py-3 rounded-2xl transition-colors shadow-lg shadow-indigo-200 w-full sm:w-auto"
              >
                {t("nav.dashboard")}
              </Link>
              <Link
                href={`/${safeLocale}/chat`}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-indigo-700 border border-indigo-200 font-semibold text-base px-6 py-3 rounded-2xl transition-colors w-full sm:w-auto"
              >
                {t("dashboard.startNew")}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
                <Link
                  href={`/${safeLocale}/signup`}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base px-6 py-3 rounded-2xl transition-colors shadow-lg shadow-indigo-200 w-full sm:w-auto"
                >
                  {t("landing.ctaSignup")}
                </Link>
                <Link
                  href={`/${safeLocale}/login`}
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-indigo-700 border border-indigo-200 font-semibold text-base px-6 py-3 rounded-2xl transition-colors w-full sm:w-auto"
                >
                  {t("landing.ctaLogin")}
                </Link>
              </div>
              <p className="text-sm text-gray-400">
                {t("landing.orGuestPrefix")}{" "}
                <Link
                  href={`/${safeLocale}/chat`}
                  className="text-gray-600 hover:text-gray-900 underline underline-offset-2"
                >
                  {t("landing.ctaGuest")}
                </Link>
                <br />
                <span className="text-xs">{t("landing.guestNote")}</span>
              </p>
            </>
          )}
        </div>

        {/* Feature cards */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto w-full">
          {[
            {
              icon: "✨",
              title: t("landing.features.personalized"),
              desc: t("landing.features.personalizedDesc"),
            },
            {
              icon: "🗺️",
              title: t("landing.features.german"),
              desc: t("landing.features.germanDesc"),
            },
            {
              icon: "🎯",
              title: t("landing.features.free"),
              desc: t("landing.features.freeDesc"),
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 text-left shadow-sm border border-gray-100"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter locale={safeLocale} />
    </div>
  );
}
