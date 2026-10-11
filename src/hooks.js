import { useEffect, useRef, useState } from 'react';

// Smoothly counts toward `target`. Instant when the user prefers reduced motion.
export function useCount(target, duration = 1100) {
  const [value, setValue] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { current.current = target; setValue(target); return undefined; }
    const origin = current.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      current.current = origin + (target - origin) * (1 - Math.pow(1 - p, 3));
      setValue(current.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}
