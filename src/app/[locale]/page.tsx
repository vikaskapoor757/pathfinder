import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { Logo } from "@/components/Logo";
import { BrandBanner } from "@/components/BrandBanner";
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
      {/* Soft background accent — subtle navy + amber glows */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(30,64,175,0.08), transparent 70%), radial-gradient(ellipse 50% 40% at 90% 100%, rgba(245,158,11,0.06), transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <Link href={`/${safeLocale}`} aria-label="Pathfinder">
          <Logo variant="full" />
        </Link>
        <Link
          href={`/${otherLocale}`}
          className="text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors border border-stone-200 dark:border-stone-700 rounded-full px-3 py-1"
        >
          {otherLocale === "de" ? "Deutsch" : "English"}
        </Link>
      </header>

      {/* Hero */}
      <main className="relative flex-1 flex flex-col items-center justify-start px-6 pt-8 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-blue-100 dark:border-blue-800/50">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          {t("landing.audience")}
        </div>

        <BrandBanner className="mb-10" />

        {user ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/${safeLocale}/dashboard`}
              className="inline-flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 active:scale-[0.98] text-white font-semibold text-base px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-800/20 w-full sm:w-auto"
            >
              {t("nav.dashboard")}
            </Link>
            <Link
              href={`/${safeLocale}/chat`}
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[0.98] text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800/60 font-semibold text-base px-6 py-3 rounded-2xl transition-all w-full sm:w-auto"
            >
              {t("dashboard.startNew")}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <Link
                href={`/${safeLocale}/signup`}
                className="inline-flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 active:scale-[0.98] text-white font-semibold text-base px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-800/20 w-full sm:w-auto"
              >
                {t("landing.ctaSignup")}
              </Link>
              <Link
                href={`/${safeLocale}/login`}
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[0.98] text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800/60 font-semibold text-base px-6 py-3 rounded-2xl transition-all w-full sm:w-auto"
              >
                {t("landing.ctaLogin")}
              </Link>
            </div>
            <p className="text-sm text-stone-400 dark:text-stone-500">
              {t("landing.orGuestPrefix")}{" "}
              <Link
                href={`/${safeLocale}/chat`}
                className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 underline underline-offset-2"
              >
                {t("landing.ctaGuest")}
              </Link>
              <br />
              <span className="text-xs">{t("landing.guestNote")}</span>
            </p>
          </>
        )}
      </main>

      <SiteFooter locale={safeLocale} />
    </div>
  );
}
