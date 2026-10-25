import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SiteFooter } from "@/components/SiteFooter";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { signOutAction } from "./actions";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = locale === "en" ? "en" : "de";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${safeLocale}/login`);
  }

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, title, locale, updated_at")
    .eq("archived", false)
    .order("updated_at", { ascending: false })
    .limit(50);

  const t = await getTranslations({ locale: safeLocale, namespace: "dashboard" });
  const tNav = await getTranslations({ locale: safeLocale, namespace: "nav" });

  return (
    <div className="min-h-full flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full border-b border-gray-100 dark:border-stone-800">
        <Link href={`/${safeLocale}`} aria-label="Pathfinder">
          <Logo variant="full" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-stone-400 hidden sm:inline">{user.email}</span>
          <form action={signOutAction.bind(null, safeLocale)}>
            <button
              type="submit"
              className="text-sm font-medium text-gray-500 dark:text-stone-400 hover:text-gray-800 dark:text-stone-200 border border-gray-200 dark:border-stone-700 rounded-full px-3 py-1 transition-colors"
            >
              {tNav("logout")}
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">{t("title")}</h1>
          <Link
            href={`/${safeLocale}/chat`}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            + {t("startNew")}
          </Link>
        </div>

        {!conversations || conversations.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-gray-100 dark:border-stone-800">
            <p className="text-gray-500 dark:text-stone-400 mb-6">{t("empty")}</p>
            <Link
              href={`/${safeLocale}/chat`}
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              {t("startNew")}
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/${safeLocale}/chat/${c.id}`}
                  className="flex items-center justify-between bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800 hover:border-teal-200 dark:border-teal-800/60 hover:bg-teal-50 dark:bg-teal-900/40/30 rounded-xl px-4 py-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-stone-100 truncate">
                      {c.title || t("untitled")}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-stone-500 mt-0.5">
                      {new Date(c.updated_at).toLocaleString(safeLocale === "de" ? "de-DE" : "en-US")}
                    </p>
                  </div>
                  <span className="text-teal-600 dark:text-teal-400 text-sm font-medium shrink-0 ml-3">
                    {t("openConversation")} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-16 pt-6 border-t border-gray-100 dark:border-stone-800">
          <DeleteAccountButton locale={safeLocale} />
        </div>
      </main>
      <SiteFooter locale={safeLocale} />
    </div>
  );
}
