"use client";

import { useTranslations } from "next-intl";

interface Props {
  // Number of messages the user has sent in the current conversation.
  userMessageCount: number;
}

type Phase = {
  emoji: string;
  labelKey: string;
  progress: number;
};

// Map user-message count → journey phase. The counts align with the
// 6-phase structure in the system prompt (warm-up → interests → dislikes
// → character → values → context) that unlocks recommendations around
// 12–14 exchanges.
function getPhase(count: number): Phase {
  if (count === 0) return { emoji: "👋", labelKey: "start", progress: 5 };
  if (count <= 2) return { emoji: "👋", labelKey: "warmup", progress: 15 };
  if (count <= 5) return { emoji: "💭", labelKey: "interests", progress: 32 };
  if (count <= 7) return { emoji: "🚫", labelKey: "dislikes", progress: 48 };
  if (count <= 10) return { emoji: "🧩", labelKey: "character", progress: 68 };
  if (count <= 12) return { emoji: "💎", labelKey: "values", progress: 84 };
  if (count <= 14) return { emoji: "🧭", labelKey: "almostThere", progress: 95 };
  return { emoji: "🎯", labelKey: "recommendations", progress: 100 };
}

export function ChatProgress({ userMessageCount }: Props) {
  const t = useTranslations("chat.progress");
  const { emoji, labelKey, progress } = getPhase(userMessageCount);

  return (
    <div className="shrink-0 border-b border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/50 backdrop-blur-sm px-4 py-2.5">
      <div className="max-w-3xl mx-auto flex items-center gap-3">
        <span
          className="text-2xl shrink-0 leading-none"
          aria-hidden
        >
          {emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <span className="text-xs font-medium text-stone-700 dark:text-stone-300 truncate">
              {t(labelKey)}
            </span>
            <span className="text-[11px] text-stone-500 shrink-0 tabular-nums font-medium">
              {progress}%
            </span>
          </div>
          <div
            className="h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-teal-600 dark:bg-teal-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
