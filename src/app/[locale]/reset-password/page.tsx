import Link from "next/link";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: "de" | "en" = locale === "en" ? "en" : "de";

  // Reset only makes sense in a one-time-token session (after clicking the email link).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${safeLocale}/login`);
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="px-6 py-4 max-w-5xl mx-auto w-full">
        <Link href={`/${safeLocale}`} className="text-xl font-bold tracking-tight text-indigo-600">
          Pathfinder
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <ResetPasswordForm locale={safeLocale} />
      </main>
      <SiteFooter locale={safeLocale} />
    </div>
  );
}
