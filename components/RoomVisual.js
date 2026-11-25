/**
 * Elegant generated "photo" placeholder for each room type.
 * Replace with real photos later by putting files in /public/images and
 * rendering <img> in place of this component.
 */
import { findImage } from "@/lib/images";

export default function RoomVisual({ hue = 32, label, slug, src, className = "" }) {
  const photo = src || (slug ? findImage(slug) : null);
  if (photo) {
    return (
      <div className={`relative overflow-hidden bg-night ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={label || slug || "Phòng khách sạn"} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        {label && (
          <>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-3 left-4 text-[0.65rem] uppercase tracking-[0.28em] text-white/90">{label}</span>
          </>
        )}
      </div>
    );
  }
  const a = `hsl(${hue} 35% 22%)`;
  const b = `hsl(${hue} 45% 52%)`;
  const c = `hsl(${hue} 55% 80%)`;
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`glow-${hue}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c} stopOpacity="0.55" />
            <stop offset="1" stopColor={c} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="400" height="300" fill={`url(#glow-${hue})`} />
        {/* window */}
        <rect x="240" y="40" width="110" height="140" fill={c} opacity="0.35" />
        <path d="M295 40v140M240 110h110" stroke={a} strokeWidth="3" opacity="0.5" />
        {/* bed */}
        <rect x="40" y="170" width="190" height="60" rx="3" fill={a} opacity="0.7" />
        <rect x="40" y="150" width="190" height="30" rx="3" fill={c} opacity="0.55" />
        <rect x="52" y="156" width="55" height="20" rx="8" fill="#fff" opacity="0.6" />
        <rect x="118" y="156" width="55" height="20" rx="8" fill="#fff" opacity="0.6" />
        {/* floor */}
        <rect x="0" y="232" width="400" height="68" fill={a} opacity="0.55" />
        {/* lamp */}
        <circle cx="260" cy="200" r="3" fill={c} />
        <path d="M260 203v28" stroke={c} strokeWidth="2" />
        <path d="M248 200l12-22 12 22z" fill={c} opacity="0.8" />
      </svg>
      {label && (
        <span className="absolute bottom-3 left-4 text-[0.65rem] uppercase tracking-[0.28em] text-white/80">{label}</span>
      )}
    </div>
  );
}
