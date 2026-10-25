import Image from "next/image";

interface Props {
  className?: string;
}

// Full brand banner (logo + wordmark + tagline + pillars) used as the
// landing hero. The source PNG is wide, so it's displayed at its natural
// aspect ratio inside a responsive container.
export function BrandBanner({ className }: Props) {
  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className ?? ""}`}>
      <Image
        src="/brand/pathfinder-banner.png"
        alt="Pathfinder — Explore today. Build tomorrow."
        width={1240}
        height={1240}
        priority
        sizes="(min-width: 768px) 640px, 100vw"
        className="w-full h-auto rounded-2xl"
      />
    </div>
  );
}
