import type { ModuleKey } from "@/lib/schema";
import { ALL_MODULES } from "@/lib/schema";

/** Default modules for editor (client) users when none are configured */
const DEFAULT_EDITOR_MODULES: ModuleKey[] = [
  "dashboard",
  "analytics",
  "blog",
  "portfolio",
  "testimonials",
  "forms",
  "settings",
];

/**
 * Parses the allowed_modules JSON string into an array of module keys.
 * Admin users always get all modules.
 */
export function parseAllowedModules(
  role: "admin" | "editor",
  allowedModulesJson: string | null,
): ModuleKey[] {
  if (role === "admin") return [...ALL_MODULES];

  if (!allowedModulesJson) return DEFAULT_EDITOR_MODULES;

  try {
    const parsed = JSON.parse(allowedModulesJson);
    if (!Array.isArray(parsed)) return DEFAULT_EDITOR_MODULES;
    return parsed.filter((m: string) =>
      (ALL_MODULES as readonly string[]).includes(m),
    ) as ModuleKey[];
  } catch {
    return DEFAULT_EDITOR_MODULES;
  }
}

/**
 * Checks if a user has access to a specific module.
 */
export function hasModuleAccess(
  role: "admin" | "editor",
  allowedModulesJson: string | null,
  moduleKey: ModuleKey,
): boolean {
  const modules = parseAllowedModules(role, allowedModulesJson);
  return modules.includes(moduleKey);
}

/** Module display labels (used in UI) */
export const MODULE_LABELS: Record<ModuleKey, { en: string; pt: string }> = {
  dashboard: { en: "Dashboard", pt: "Dashboard" },
  analytics: { en: "Analytics", pt: "Analytics" },
  blog: { en: "Blog", pt: "Blog" },
  portfolio: { en: "Portfolio", pt: "Portfólio" },
  testimonials: { en: "Testimonials", pt: "Depoimentos" },
  forms: { en: "Forms / Leads", pt: "Formulários / Leads" },
  images: { en: "Site Images", pt: "Imagens do Site" },
  banners: { en: "Banners", pt: "Banners" },
  seo: { en: "SEO", pt: "SEO" },
  pixels: { en: "Pixels & SEO", pt: "Pixels & SEO" },
  settings: { en: "Settings", pt: "Configurações" },
  users: { en: "Users", pt: "Usuários" },
  social: { en: "Social Media", pt: "Redes Sociais" },
  "api-docs": { en: "API Docs", pt: "API Docs" },
};
