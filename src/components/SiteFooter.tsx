import Link from "next/link";
import { getTranslations } from "next-intl/server";

interface Props {
  locale: "de" | "en";
}

export async function SiteFooter({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <footer className="text-xs text-gray-400 py-6 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>© {new Date().getFullYear()} Pathfinder</span>
        <div className="flex gap-4">
          <a
            href="https://tally.so/r/Y5kjXJ"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 transition-colors"
          >
            {t("feedback")}
          </a>
          <Link
            href={`/${locale}/impressum`}
            className="hover:text-gray-600 transition-colors"
          >
            {t("impressum")}
          </Link>
          <Link
            href={`/${locale}/datenschutz`}
            className="hover:text-gray-600 transition-colors"
          >
            {t("privacy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
