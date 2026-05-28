"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

const STORAGE_KEY = "pf_age_confirmed_at";

interface Props {
  locale: "de" | "en";
  children: React.ReactNode;
}

export function AgeGate({ locale, children }: Props) {
  // `null` = still reading localStorage (avoid SSR/CSR flash);
  // `true` = already confirmed; `false` = needs confirmation.
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const t = useTranslations("ageGate");

  useEffect(() => {
    try {
      setConfirmed(Boolean(window.localStorage.getItem(STORAGE_KEY)));
    } catch {
      setConfirmed(false);
    }
  }, []);

  function handleConfirm() {
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // Private mode / blocked storage — accept this session anyway.
    }
    setConfirmed(true);
  }

  if (confirmed === null) {
    return <div className="h-full" />;
  }

  if (confirmed) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-full flex items-center justify-center px-6 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-4xl mb-4 text-center">🔞</div>
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          {t("title")}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          {t("body")}
        </p>
        <button
          onClick={handleConfirm}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors mb-3"
        >
          {t("confirm")}
        </button>
        <Link
          href={`/${locale}`}
          className="block w-full text-center text-sm font-medium text-gray-500 hover:text-gray-800 py-2"
        >
          {t("decline")}
        </Link>
        <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
          {t("why")}
        </p>
      </div>
    </div>
  );
}
