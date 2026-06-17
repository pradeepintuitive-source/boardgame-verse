import { useMemo } from "react";

/** Ambient drifting particles (CSS keyframes, GPU-cheap). */
export function ParticleField({ count = 14 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: ((i * 37 + 11) % 100) + ((i % 5) * 0.13),
        top: 60 + ((i * 19 + 7) % 40),
        delay: ((i * 23) % 80) / 10,
        duration: 8 + ((i * 17) % 100) / 10,
        color: i % 3 === 0 ? "bg-accent-pink" : "bg-accent-cyan",
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute h-1 w-1 rounded-full ${p.color} opacity-50`}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `float-particle ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}