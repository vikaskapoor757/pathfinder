"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface Props {
  locale: "de" | "en";
}

export function ResetPasswordForm({ locale }: Props) {
  const t = useTranslations("auth");
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (password.length < 8) {
      setError(t("errorWeakPassword"));
      return;
    }
    if (password !== confirm) {
      setError(t("errorPasswordMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) {
        console.error("Supabase updateUser error:", updateErr);
        setError(updateErr.message || t("errorGeneric"));
        return;
      }
      setInfo(t("resetPasswordSuccess"));
      // Brief delay so user sees the success message, then send them to dashboard.
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error("Reset unexpected error:", err);
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {t("resetPasswordTitle")}
      </h1>
      <p className="text-sm text-gray-500 mb-6 text-center">{t("resetPasswordBody")}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("newPassword")}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            autoComplete="new-password"
            minLength={8}
            autoFocus
          />
          <p className="text-xs text-gray-400 mt-1">{t("passwordHint")}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("confirmPassword")}</label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            autoComplete="new-password"
            minLength={8}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {info && (
          <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg px-3 py-2">
            {info}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          {t("resetPasswordButton")}
        </button>
      </form>
    </div>
  );
}
