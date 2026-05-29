"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface Props {
  locale: "de" | "en";
}

export function ForgotPasswordForm({ locale }: Props) {
  const t = useTranslations("auth");
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/reset-password`,
      });
      if (resetErr) {
        console.error("Supabase reset error:", resetErr);
        setError(resetErr.message || t("errorGeneric"));
        return;
      }
      setInfo(t("forgotPasswordSent"));
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
        {t("forgotPasswordTitle")}
      </h1>
      <p className="text-sm text-gray-500 mb-6 text-center">{t("forgotPasswordBody")}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("email")}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            autoComplete="email"
            autoFocus
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
          {t("forgotPasswordButton")}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        <Link
          href={`/${locale}/login`}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
