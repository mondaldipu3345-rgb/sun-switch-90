import { useEffect, useRef } from "react";

export default function Splash({ onDone }) {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const t = setTimeout(() => doneRef.current && doneRef.current(), 3200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="ss-splash" data-testid="splash-screen">
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
        <svg width="220" height="220" viewBox="0 0 220 220" className="absolute inset-0">
          <circle className="ss-ring" cx="110" cy="110" r="102" fill="none" stroke="#1E3A8A" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <img src="/logo.png" alt="SUN SWITCH" className="ss-logo w-40 h-40 rounded-full object-cover" />
      </div>
      <span className="ss-tag mt-7 text-xs tracking-[0.25em] uppercase text-slate-400">The energy of future</span>
    </div>
  );
}
