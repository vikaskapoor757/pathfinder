"use client";

import { useTranslations } from "next-intl";

interface Props {
  // Number of messages the user has sent — used as a fallback.
  userMessageCount: number;
  // Phase the AI signalled on its latest message, if any. Takes precedence
  // over the count-based inference so phases can move back and forth
  // (e.g. if the user is unsure and the AI steps back to interests).
  phase?: string | null;
}

type PhaseInfo = {
  emoji: string;
  labelKey: string;
  progress: number;
};

const PHASE_INFO: Record<string, PhaseInfo> = {
  start: { emoji: "👋", labelKey: "start", progress: 5 },
  warmup: { emoji: "👋", labelKey: "warmup", progress: 15 },
  interests: { emoji: "💭", labelKey: "interests", progress: 32 },
  dislikes: { emoji: "🚫", labelKey: "dislikes", progress: 48 },
  character: { emoji: "🧩", labelKey: "character", progress: 68 },
  values: { emoji: "💎", labelKey: "values", progress: 84 },
  almostThere: { emoji: "🧭", labelKey: "almostThere", progress: 95 },
  recommendations: { emoji: "🎯", labelKey: "recommendations", progress: 100 },
};

// Fallback when the AI hasn't signalled a phase yet (e.g. first message).
function phaseFromCount(count: number): PhaseInfo {
  if (count === 0) return PHASE_INFO.start;
  if (count <= 2) return PHASE_INFO.warmup;
  if (count <= 5) return PHASE_INFO.interests;
  if (count <= 7) return PHASE_INFO.dislikes;
  if (count <= 10) return PHASE_INFO.character;
  if (count <= 12) return PHASE_INFO.values;
  if (count <= 14) return PHASE_INFO.almostThere;
  return PHASE_INFO.recommendations;
}

export function ChatProgress({ userMessageCount, phase }: Props) {
  const t = useTranslations("chat.progress");
  const info = phase && PHASE_INFO[phase] ? PHASE_INFO[phase] : phaseFromCount(userMessageCount);
  const { emoji, labelKey, progress } = info;

  return (
    <div className="shrink-0 border-b border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/50 backdrop-blur-sm px-4 py-2.5">
      <div className="max-w-3xl mx-auto flex items-center gap-3">
        <span className="text-2xl shrink-0 leading-none" aria-hidden>
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
