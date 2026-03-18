"use client";

import { useI18n, type Locale } from "@/lib/i18n";

const LOCALES: { value: Locale; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "pt", label: "Português", flag: "🇧🇷" },
];

type Variant = "sidebar" | "light";

/** Language toggle button with flag indicator */
export function LanguageSelector({ variant = "sidebar" }: { variant?: Variant }) {
  const { locale, setLocale } = useI18n();
  const current = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];
  const next = LOCALES.find((l) => l.value !== locale) ?? LOCALES[1];

  const baseStyles = "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors";
  const variantStyles: Record<Variant, string> = {
    sidebar: "text-sidebar-text hover:bg-white/5 hover:text-sidebar-text-active w-full",
    light: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
  };

  return (
    <button
      type="button"
      onClick={() => setLocale(next.value)}
      className={`${baseStyles} ${variantStyles[variant]}`}
      title={`Switch to ${next.label}`}
    >
      <span className="text-base leading-none">{current.flag}</span>
      <span>{current.label}</span>
      <svg className="ml-auto h-3.5 w-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    </button>
  );
}
