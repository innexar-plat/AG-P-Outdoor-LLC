"use client";

import { I18nProvider } from "@/lib/i18n";
import type { ReactNode } from "react";

/** Client-side providers wrapper (i18n, future: theme, etc.) */
export function Providers({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
