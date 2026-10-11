import { useEffect, useState } from 'react';

const COLORS = ['#d93d6e', '#f07a9b', '#f6b3c6', '#f0966f', '#b99be6'];

// A short, quiet burst of petals when a period is logged.
export default function Petals({ burst }) {
  const [petals, setPetals] = useState([]);
  useEffect(() => {
    if (!burst || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    setPetals(Array.from({ length: 22 }, (_, i) => ({
      id: `${burst}-${i}`,
      x: (Math.random() - 0.5) * 340,
      y: 220 + Math.random() * 260,
      r: Math.random() * 540 - 270,
      c: COLORS[i % COLORS.length],
      d: Math.random() * 260,
      s: 10 + Math.random() * 12,
    })));
    const t = setTimeout(() => setPetals([]), 3200);
    return () => clearTimeout(t);
  }, [burst]);
  return (
    <div className="petals" aria-hidden="true">
      {petals.map((p) => (
        <i key={p.id} style={{ '--x': `${p.x}px`, '--y': `${p.y}px`, '--r': `${p.r}deg`, background: p.c, width: p.s, height: p.s, animationDelay: `${p.d}ms` }} />
      ))}
    </div>
  );
}
