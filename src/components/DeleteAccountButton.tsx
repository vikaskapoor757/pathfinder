"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface Props {
  locale: "de" | "en";
}

export function DeleteAccountButton({ locale }: Props) {
  const t = useTranslations("dashboard.delete");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirmed) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("errorGeneric"));
      }
      router.push(`/${locale}?deleted=1`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorGeneric"));
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
      >
        {t("trigger")}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md w-full">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{t("title")}</h2>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{t("body")}</p>

        <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer select-none mb-4">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-300"
          />
          <span>{t("confirmCheckbox")}</span>
        </label>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              setOpen(false);
              setConfirmed(false);
              setError(null);
            }}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleDelete}
            disabled={!confirmed || submitting}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            {submitting ? t("deleting") : t("confirmButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
