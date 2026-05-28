import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ChatInterface } from "@/components/ChatInterface";
import { AgeGate } from "@/components/AgeGate";
import { createClient } from "@/lib/supabase/server";

export default async function ResumeChatPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const safeLocale: "de" | "en" = locale === "en" ? "en" : "de";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${safeLocale}/login`);
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, title, locale")
    .eq("id", id)
    .single();

  if (!conversation) {
    notFound();
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const initialMessages =
    (messages ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })) ?? [];

  const t = await getTranslations({ locale: safeLocale, namespace: "chat" });
  const tNav = await getTranslations({ locale: safeLocale, namespace: "nav" });
  const tDash = await getTranslations({ locale: safeLocale, namespace: "dashboard" });

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/${safeLocale}/dashboard`}
            className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            aria-label={tNav("back")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <span className="font-semibold text-gray-900 truncate">
            {conversation.title || tDash("untitled")}
          </span>
        </div>
        <Link
          href={`/${safeLocale}/chat`}
          className="text-xs font-medium text-gray-500 hover:text-gray-800 border border-gray-200 rounded-full px-3 py-1 transition-colors shrink-0"
        >
          + {t("newConversation")}
        </Link>
      </header>

      <AgeGate locale={safeLocale}>
        <ChatInterface
          locale={safeLocale}
          initialMessages={initialMessages}
          initialConversationId={id}
        />
      </AgeGate>
    </div>
  );
}
