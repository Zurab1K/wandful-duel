import { useMemo } from "react";

export default function FloatingParticles({ count = 20 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 10,
        duration: Math.random() * 8 + 6,
        opacity: Math.random() * 0.5 + 0.2,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary animate-float-up"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px hsl(var(--gold-glow) / 0.6)`,
          }}
        />
      ))}
    </div>
  );
}
