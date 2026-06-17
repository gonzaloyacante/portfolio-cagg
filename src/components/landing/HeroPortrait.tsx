'use client';

import Image from 'next/image';

import { useMouseParallax } from '@/hooks/use-mouse-parallax';

type HeroPortraitProps = {
  src: string;
  alt: string;
  figLabel: string;
  name: string;
  origin: string;
};

export function HeroPortrait({ src, alt, figLabel, name, origin }: HeroPortraitProps) {
  const [ref, offset] = useMouseParallax(8);
  return (
    <div
      ref={ref}
      className="border-border bg-card relative border will-change-transform"
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div className="text-label tracking-label text-muted-foreground bg-background absolute -top-3 -left-3 px-2 font-mono">
        {figLabel}
      </div>
      <Image
        src={src}
        alt={alt}
        width={400}
        height={520}
        sizes="(max-width: 1024px) 100vw, 33vw"
        quality={85}
        className="block h-auto w-full grayscale-[15%]"
        draggable={false}
        priority
        fetchPriority="high"
      />
      <div className="border-border flex items-center justify-between border-t px-5 py-4">
        <span className="text-label tracking-label text-muted-foreground font-mono uppercase">
          {name}
        </span>
        <span className="text-label tracking-label text-muted-foreground/60 font-mono">
          {origin}
        </span>
      </div>
    </div>
  );
}
