import { useEffect, useState } from 'react';

const C = 150;
const R = 116;
const KEYS = ['menstrual', 'follicular', 'ovulation', 'luteal'];

const polar = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
};
const arc = (r, a0, a1) => {
  const [x0, y0] = polar(r, a0);
  const [x1, y1] = polar(r, a1);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

// The signature element: the whole cycle as a ring of four phases with a glowing marker for today.
export default function Ring({ length, periodLen, ovDay, day, phase, label, children }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const per = 360 / length;
  const bounds = [0, periodLen, ovDay - 2, ovDay + 1, length];
  const GAP = 10;
  const arcs = KEYS.map((k, i) => ({ k, a0: bounds[i] * per + GAP / 2, a1: bounds[i + 1] * per - GAP / 2 })).filter((a) => a.a1 > a.a0);
  const fertile = [Math.max(0, ovDay - 6) * per + 1, Math.min(length, ovDay + 1) * per - 1];
  const angle = Math.min(length, Math.max(0.5, day - 0.5)) * per;

  return (
    <div className="ring" role="img" aria-label={label}>
      <svg viewBox="0 0 300 300">
        <defs>
          <filter id="halo" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7" /></filter>
        </defs>
        <circle cx={C} cy={C} r={R + 24} className="rim" />
        {arcs.map((a, i) => (
          <path key={a.k} d={arc(R, a.a0, a.a1)} pathLength="1" className={`seg ${a.k} ${a.k === phase ? 'cur' : ''}`} style={{ animationDelay: `${i * 170}ms` }} />
        ))}
        <path d={arc(R - 22, fertile[0], fertile[1])} pathLength="1" className="fert" />
        <g className="orbit" style={{ transform: `rotate(${armed ? angle : 0}deg)` }}>
          <circle cx={C} cy={C - R} r="20" className="halo" filter="url(#halo)" />
          <circle cx={C} cy={C - R} r="11.500" className="knob" />
          <circle cx={C} cy={C - R} r="4.500" className="knob-core" />
        </g>
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}
