import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";

// LEGAL: Replace this placeholder text with a real Datenschutzerklärung generated via
// e-recht24.de, datenschutz-generator.de, or reviewed by a German privacy lawyer
// before any public launch. The structure below covers the minimum sections you'll need.

export const metadata = {
  title: "Datenschutzerklärung — Pathfinder",
};

export default async function DatenschutzPage({
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Datenschutzerklärung</h1>

        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          ⚠️ <strong>Entwurf — nicht für den öffentlichen Live-Betrieb geeignet.</strong>{" "}
          Dieser Text ist ein grobes Gerüst für die geschlossene Friends-and-Family-Testphase.
          Vor jeder öffentlichen Veröffentlichung muss er durch eine vollwertige
          Datenschutzerklärung ersetzt werden (e-recht24.de, datenschutz-generator.de oder
          juristische Beratung).
        </div>

        <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2">
          1. Verantwortlicher
        </h2>
        <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">
          {`Vikas Kapoor
Gundelfinger Str 17
10318 Berlin
Deutschland
E-Mail: contact@mypathfinderapps.com`}
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2">
          2. Welche Daten wir verarbeiten
        </h2>
        <ul className="text-sm text-gray-700 mb-4 list-disc list-inside space-y-1">
          <li>E-Mail-Adresse (für Anmeldung und Login)</li>
          <li>Optional verschlüsseltes Passwort (bei Passwort-Login)</li>
          <li>Sprachpräferenz (de/en)</li>
          <li>Inhalte deiner Chat-Gespräche mit Pathfinder</li>
          <li>Technische Daten (IP-Adresse, Zeitstempel, Browser) — nur zur Sicherheit, nicht zur Profilbildung</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2">
          3. Zweck und Rechtsgrundlage
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Wir verarbeiten deine Daten, um dir personalisierte Berufsorientierung anzubieten
          (Vertragserfüllung nach Art. 6 Abs. 1 lit. b DSGVO) und um den Dienst sicher zu
          betreiben (berechtigtes Interesse nach Art. 6 Abs. 1 lit. f DSGVO).
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2">
          4. Dienste und Datenempfänger
        </h2>
        <ul className="text-sm text-gray-700 mb-4 list-disc list-inside space-y-1">
          <li>
            <strong>Supabase</strong> (EU, Frankfurt) — Speicherung von Konten und Gesprächen.
          </li>
          <li>
            <strong>Anthropic</strong> (USA, EU-Endpoints verfügbar) — Verarbeitung deiner
            Chat-Inhalte durch das Sprachmodell Claude, um Antworten zu generieren.
          </li>
          <li>
            <strong>Vercel</strong> (Hosting, EU-Region wo möglich) — Auslieferung der App.
          </li>
          <li>[TODO: Resend (E-Mail-Versand), Sentry (Fehlerprotokollierung), PostHog (Analytics) — ergänzen, sobald aktiviert.]</li>
        </ul>

        <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2">
          5. Speicherdauer
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Konto- und Gesprächsdaten speichern wir, solange dein Konto besteht. Bei Löschung
          deines Kontos werden alle personenbezogenen Daten unverzüglich entfernt.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2">
          6. Deine Rechte
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17),
          Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21).
          Schreib uns dazu an contact@mypathfinderapps.com. Außerdem kannst du dich
          jederzeit bei einer Datenschutz-Aufsichtsbehörde beschweren.
        </p>

        <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2">
          7. Altersgrenze
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          Pathfinder ist für Personen ab 16 Jahren gedacht. Wir setzen voraus, dass du dein
          Alter wahrheitsgemäß bestätigst (siehe Anmeldung).
        </p>

        <p className="text-xs text-gray-400 mt-12">Stand: {new Date().toISOString().slice(0, 10)}</p>
      </main>

      <SiteFooter locale={safeLocale} />
    </div>
  );
}
