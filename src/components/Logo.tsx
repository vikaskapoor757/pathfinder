import Image from "next/image";

// Pathfinder brand mark + wordmark.
// Mark is a raster PNG (public/brand/pathfinder-mark.png) rendered via
// next/image for proper sizing + lazy loading. Wordmark is text in the
// display face so it stays sharp at any size and auto-adapts to dark mode.

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
    <Image
      src="/brand/pathfinder-mark.png"
      alt="Pathfinder"
      width={64}
      height={64}
      priority
      className={className ?? "h-8 w-8"}
    />
  );
}

function LogoWordmark({ className }: { className?: string }) {
  return (
    <span
      className={`font-display font-bold text-blue-900 dark:text-blue-200 text-xl tracking-tight ${className ?? ""}`}
    >
      Pathfinder
    </span>
  );
}
