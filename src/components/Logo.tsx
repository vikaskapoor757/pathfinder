// Pathfinder brand mark + wordmark, implemented entirely in SVG so it
// scales infinitely, needs no asset pipeline, and can be colour-themed
// with Tailwind utility classes.
//
// Mark concept: a stylised compass needle pointing north. The teal half is
// the "find" direction; the coral half is where you've come from.

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
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark className="h-7 w-7" />
      <LogoWordmark />
    </span>
  );
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className ?? "h-6 w-6"}
      role="img"
      aria-label="Pathfinder"
    >
      {/* Needle: four triangles meeting at the pivot. Top half teal
          (where you're heading), bottom half coral (where you came from). */}
      <path d="M16 2 L22 16 L16 16 Z" fill="#0D9488" />
      <path d="M16 2 L10 16 L16 16 Z" fill="#0F766E" />
      <path d="M16 30 L22 16 L16 16 Z" fill="#FB923C" />
      <path d="M16 30 L10 16 L16 16 Z" fill="#F97316" />
      {/* Center pivot */}
      <circle cx="16" cy="16" r="1.75" fill="#1C1917" />
    </svg>
  );
}

function LogoWordmark({ className }: { className?: string }) {
  return (
    <span
      className={`font-display font-bold text-teal-800 text-lg tracking-tight ${className ?? ""}`}
    >
      Pathfinder
    </span>
  );
}
