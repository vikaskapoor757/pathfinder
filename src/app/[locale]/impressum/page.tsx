import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

// LEGAL: This page must contain real data per §5 TMG before any public launch.
// Fields below are placeholders — replace with your actual personal/business info.

export const metadata = {
  title: "Impressum — Pathfinder",
};

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: "de" | "en" = locale === "en" ? "en" : "de";

  return (
    <div className="min-h-full flex flex-col">
      <header className="px-6 py-4 max-w-5xl mx-auto w-full">
        <Link href={`/${safeLocale}`} className="text-xl font-bold tracking-tight text-indigo-600">
          Pathfinder
        </Link>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 prose prose-sm prose-gray">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Impressum</h1>

        <p className="text-sm text-gray-600 mb-2 font-medium">
          Angaben gemäß § 5 TMG
        </p>
        <p className="text-sm text-gray-700 mb-6 whitespace-pre-line">
          {`Vikas Kapoor
Gundelfinger Str 17
10318 Berlin
Deutschland`}
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2">Kontakt</h2>
        <p className="text-sm text-gray-700 mb-6 whitespace-pre-line">
          {`E-Mail: contact@mypathfinderapps.com`}
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2">
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
        </h2>
        <p className="text-sm text-gray-700 mb-6 whitespace-pre-line">
          {`Vikas Kapoor
Gundelfinger Str 17
10318 Berlin
Deutschland`}
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2">EU-Streitschlichtung</h2>
        <p className="text-sm text-gray-700 mb-2">
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
          .
        </p>
        <p className="text-sm text-gray-700 mb-6">
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>

      </main>

      <SiteFooter locale={safeLocale} />
    </div>
  );
}
