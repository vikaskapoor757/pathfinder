import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { Logo } from "@/components/Logo";
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
    <div className="min-h-full flex flex-col relative overflow-hidden">
      {/* Soft background accent — reinforces warm/teal palette */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(13,148,136,0.08), transparent 70%), radial-gradient(ellipse 50% 40% at 90% 100%, rgba(251,146,60,0.08), transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <Link href={`/${safeLocale}`} aria-label="Pathfinder">
          <Logo variant="full" />
        </Link>
        <Link
          href={`/${otherLocale}`}
          className="text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors border border-stone-200 rounded-full px-3 py-1"
        >
          {otherLocale === "de" ? "Deutsch" : "English"}
        </Link>
      </header>

      {/* Hero */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8 border border-teal-100">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            {t("landing.audience")}
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-bold text-stone-900 mb-6 leading-[1.05] tracking-tight">
            {t("landing.headline")}
          </h1>
          <p className="text-lg sm:text-xl text-stone-500 mb-10 max-w-xl mx-auto leading-relaxed">
            {t("landing.subheadline")}
          </p>

          {user ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/${safeLocale}/dashboard`}
                className="inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-semibold text-base px-6 py-3 rounded-2xl transition-all shadow-lg shadow-teal-700/20 w-full sm:w-auto"
              >
                {t("nav.dashboard")}
              </Link>
              <Link
                href={`/${safeLocale}/chat`}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 active:scale-[0.98] text-teal-800 border border-teal-200 font-semibold text-base px-6 py-3 rounded-2xl transition-all w-full sm:w-auto"
              >
                {t("dashboard.startNew")}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
                <Link
                  href={`/${safeLocale}/signup`}
                  className="inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-semibold text-base px-6 py-3 rounded-2xl transition-all shadow-lg shadow-teal-700/20 w-full sm:w-auto"
                >
                  {t("landing.ctaSignup")}
                </Link>
                <Link
                  href={`/${safeLocale}/login`}
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 active:scale-[0.98] text-teal-800 border border-teal-200 font-semibold text-base px-6 py-3 rounded-2xl transition-all w-full sm:w-auto"
                >
                  {t("landing.ctaLogin")}
                </Link>
              </div>
              <p className="text-sm text-stone-400">
                {t("landing.orGuestPrefix")}{" "}
                <Link
                  href={`/${safeLocale}/chat`}
                  className="text-stone-600 hover:text-stone-900 underline underline-offset-2"
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
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto w-full">
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
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-left border border-stone-200/60"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-display font-semibold text-stone-900 mb-1">
                {f.title}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter locale={safeLocale} />
    </div>
  );
}
