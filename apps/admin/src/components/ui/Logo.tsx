/** AG&P Outdoor brand logo — turf grass icon + wordmark */
export function Logo({
  size = "md",
  showText = true,
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}) {
  const dims = { sm: 28, md: 36, lg: 48 }[size];
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size];

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AG&P Outdoor"
      >
        {/* Dark green background */}
        <circle cx="32" cy="32" r="30" fill="#1f3810" />
        {/* Left grass blade */}
        <path d="M20 46 Q16 34 18 20 Q22 28 22 40 Z" fill="#4ade80" opacity="0.9" />
        {/* Center grass blade (tallest) */}
        <path d="M32 46 Q32 28 32 12 Q36 24 34 40 Z" fill="#86efac" />
        {/* Right grass blade */}
        <path d="M44 46 Q48 34 46 20 Q42 28 42 40 Z" fill="#4ade80" opacity="0.9" />
        {/* Ground bar */}
        <rect x="14" y="45" width="36" height="5" rx="2.5" fill="#2d5016" />
      </svg>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold tracking-wide ${textSize} bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent`}>
            AG&amp;P Outdoor
          </span>
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-medium">
            Admin Panel
          </span>
        </div>
      )}
    </div>
  );
}

/** Compact logo icon only */
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AG&P Outdoor"
    >
      <circle cx="32" cy="32" r="30" fill="#1f3810" />
      <path d="M20 46 Q16 34 18 20 Q22 28 22 40 Z" fill="#4ade80" opacity="0.9" />
      <path d="M32 46 Q32 28 32 12 Q36 24 34 40 Z" fill="#86efac" />
      <path d="M44 46 Q48 34 46 20 Q42 28 42 40 Z" fill="#4ade80" opacity="0.9" />
      <rect x="14" y="45" width="36" height="5" rx="2.5" fill="#2d5016" />
    </svg>
  );
}
