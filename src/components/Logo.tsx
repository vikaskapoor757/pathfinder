// Pathfinder brand mark + wordmark, implemented entirely in SVG so it
// scales infinitely, needs no asset pipeline, and can be colour-themed
// with Tailwind utility classes.
//
// Mark concept: a stylised compass needle. Both halves are teal (deep
// teal on top, lighter teal on bottom) so the colour palette stays
// cohesive and reads clearly in light AND dark mode.

type Variant = "full" | "mark" | "wordmark";

interface Props {
  variant?: Variant;
  className?: string;
}

export function Logo({ variant = "full", className }: Props) {
  if (variant === "mark") {
    return <LogoMark className={className} />;
  }
  if (variant === "wordmark") {
    return <LogoWordmark className={className} />;
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className="h-9 w-9" />
      <LogoWordmark />
    </span>
  );
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className ?? "h-8 w-8"}
      role="img"
      aria-label="Pathfinder"
    >
      {/* Needle: four triangles meeting at the pivot. Deep teal on top
          (direction), lighter teal on bottom. Monochrome so there's no
          colour clash and it holds up on both light and dark surfaces. */}
      <path d="M16 2 L22 16 L16 16 Z" fill="#0F766E" />
      <path d="M16 2 L10 16 L16 16 Z" fill="#115E59" />
      <path d="M16 30 L22 16 L16 16 Z" fill="#5EEAD4" />
      <path d="M16 30 L10 16 L16 16 Z" fill="#2DD4BF" />
      {/* Center pivot — stone-900 light / stone-100 dark via currentColor */}
      <circle cx="16" cy="16" r="1.75" className="fill-stone-900 dark:fill-stone-100" />
    </svg>
  );
}

function LogoWordmark({ className }: { className?: string }) {
  return (
    <span
      className={`font-display font-bold text-teal-800 dark:text-teal-300 text-xl tracking-tight ${className ?? ""}`}
    >
      Pathfinder
    </span>
  );
}
