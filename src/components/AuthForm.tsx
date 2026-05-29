"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";
type Tab = "password" | "magic";

interface Props {
  mode: Mode;
  locale: "de" | "en";
}

export function AuthForm({ mode, locale }: Props) {
  const t = useTranslations("auth");
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<Tab>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "signup" && !ageConfirmed) {
      setError(t("errorAgeRequired"));
      return;
    }

    if (mode === "signup" && password.length < 8) {
      setError(t("errorWeakPassword"));
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error: signErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { locale },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
          },
        });
        if (signErr) throw signErr;
        setInfo(t("checkEmail"));
      } else {
        const { error: signErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signErr) {
          console.error("Supabase signIn error:", signErr);
          // Distinguish bad credentials from infra errors (rate limit, network, etc.)
          const isInvalid = /invalid|credentials/i.test(signErr.message);
          setError(isInvalid ? t("errorInvalid") : signErr.message);
          return;
        }
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } catch (err) {
      console.error("Auth unexpected error:", err);
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMagic(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "signup" && !ageConfirmed) {
      setError(t("errorAgeRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const { error: magicErr } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: mode === "signup",
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/dashboard`,
        },
      });
      if (magicErr) {
        console.error("Supabase OTP error:", magicErr);
        setError(magicErr.message || t("errorGeneric"));
        return;
      }
      setInfo(t("magicLinkSent"));
    } catch (err) {
      console.error("Magic link unexpected error:", err);
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        {mode === "signup" ? t("signupTitle") : t("loginTitle")}
      </h1>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          type="button"
          onClick={() => setTab("password")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
            tab === "password" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          {t("tabPassword")}
        </button>
        <button
          type="button"
          onClick={() => setTab("magic")}
          className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
            tab === "magic" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          {t("tabMagic")}
        </button>
      </div>

      <form onSubmit={tab === "password" ? handlePassword : handleMagic} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("email")}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            autoComplete="email"
          />
        </div>

        {tab === "password" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("password")}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={8}
            />
            {mode === "signup" && (
              <p className="text-xs text-gray-400 mt-1">{t("passwordHint")}</p>
            )}
            {mode === "login" && (
              <p className="text-xs mt-1">
                <Link
                  href={`/${locale}/forgot-password`}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  {t("forgotPasswordLink")}
                </Link>
              </p>
            )}
          </div>
        )}

        {mode === "signup" && (
          <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-300"
            />
            <span>{t("ageConfirm")}</span>
          </label>
        )}

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
          {tab === "magic"
            ? t("magicLinkButton")
            : mode === "signup"
              ? t("signupButton")
              : t("loginButton")}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        {mode === "signup" ? t("hasAccount") : t("noAccount")}{" "}
        <Link
          href={`/${locale}/${mode === "signup" ? "login" : "signup"}`}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          {mode === "signup" ? t("loginLink") : t("signupLink")}
        </Link>
      </p>
    </div>
  );
}
