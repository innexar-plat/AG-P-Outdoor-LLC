/** Innexar brand logo — geometric raven SVG + wordmark */
export function Logo({
  size = "md",
  showText = true,
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}) {
  const dims = { sm: 28, md: 36, lg: 48 }[size];
  const textSize = { sm: "text-base", md: "text-xl", lg: "text-2xl" }[size];

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Innexar"
      >
        <defs>
          <linearGradient id="raven-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        {/* Body */}
        <polygon points="20,58 32,28 44,58" fill="url(#raven-grad)" opacity="0.85" />
        {/* Left wing */}
        <polygon points="8,40 24,20 32,38" fill="url(#raven-grad)" opacity="0.7" />
        {/* Right wing */}
        <polygon points="56,40 40,20 32,38" fill="url(#raven-grad)" opacity="0.7" />
        {/* Head */}
        <polygon points="26,24 32,8 38,24 32,28" fill="url(#raven-grad)" />
        {/* Eye */}
        <circle cx="32" cy="18" r="2" fill="#fff" opacity="0.9" />
        {/* Beak */}
        <polygon points="32,8 28,14 32,12" fill="#0ea5e9" />
      </svg>
      {showText && (
        <span className={`font-bold tracking-wider ${textSize} bg-gradient-to-r from-sky-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent`}>
          INNEXAR
        </span>
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
      aria-label="Innexar"
    >
      <defs>
        <linearGradient id="raven-icon" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="50%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <polygon points="20,58 32,28 44,58" fill="url(#raven-icon)" opacity="0.85" />
      <polygon points="8,40 24,20 32,38" fill="url(#raven-icon)" opacity="0.7" />
      <polygon points="56,40 40,20 32,38" fill="url(#raven-icon)" opacity="0.7" />
      <polygon points="26,24 32,8 38,24 32,28" fill="url(#raven-icon)" />
      <circle cx="32" cy="18" r="2" fill="#fff" opacity="0.9" />
      <polygon points="32,8 28,14 32,12" fill="#0ea5e9" />
    </svg>
  );
}
