import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/data/career-paths";

const anthropic = new Anthropic();

export async function POST(req: Request) {
  const { messages, locale = "de" } = await req.json();

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
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
            )
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
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
