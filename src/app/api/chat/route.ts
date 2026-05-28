import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/data/career-paths";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

interface RequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  locale?: "de" | "en";
  conversationId?: string | null;
}

export async function POST(req: Request) {
  const { messages, locale = "de", conversationId: incomingId }: RequestBody = await req.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let conversationId: string | null = incomingId ?? null;
  let createdNewConversation = false;

  if (user) {
    if (!conversationId) {
      // Title from first user message — truncated for display.
      const firstUserMsg = messages.find((m) => m.role === "user");
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 60).replace(/\s+/g, " ").trim()
        : null;

      const { data: convo, error: convoErr } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, locale, title })
        .select("id")
        .single();

      if (convoErr || !convo) {
        return new Response(JSON.stringify({ error: "Failed to create conversation" }), {
          status: 500,
        });
      }
      conversationId = convo.id;
      createdNewConversation = true;
    } else {
      // Verify user owns this conversation (defense in depth — RLS also enforces this).
      const { data: owned } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .single();
      if (!owned) {
        return new Response(JSON.stringify({ error: "Conversation not found" }), {
          status: 404,
        });
      }
    }

    // Persist the latest user message (last entry in `messages`).
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg?.role === "user") {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: lastUserMsg.content,
      });
    }
  }

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: buildSystemPrompt(locale as "de" | "en"),
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let assistantText = "";

      if (createdNewConversation && conversationId) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "meta", conversationId })}\n\n`
          )
        );
      }

      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            assistantText += chunk.delta.text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
              )
            );
          }
        }

        if (user && conversationId && assistantText) {
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: assistantText,
          });
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: err instanceof Error ? err.message : "stream_error" })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
