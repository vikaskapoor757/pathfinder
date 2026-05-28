import { AuthForm } from "@/components/AuthForm";
import { SiteFooter } from "@/components/SiteFooter";
import Link from "next/link";

export default async function LoginPage({
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
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <AuthForm mode="login" locale={safeLocale} />
      </main>
      <SiteFooter locale={safeLocale} />
    </div>
  );
}
