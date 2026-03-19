export type SiteImage = {
  id: number;
  section: string;
  slotKey: string;
  label: string;
  url: string;
  altText: string | null;
  displayType: string;
  sortOrder: number;
  carouselItems?: CarouselItem[] | string | null;
  carouselInterval?: number | null;
  carouselEffect?: string | null;
  focalX?: number | null;
  focalY?: number | null;
};

export type CarouselItem = {
  url: string;
  altText?: string | null;
  sortOrder: number;
};

/** Page sections mapped to site structure. Each section = one page or area. */
export const PAGE_SECTIONS = [
  "home",
  "about",
  "services",
  "residential-turf",
  "putting-green",
  "pet-turf",
  "commercial-turf",
  "pavers",
  "drainage-grading",
  "grass-removal",
  "portfolio",
  "contact",
  "blog",
] as const;

/** Display types: single image, gallery grid, or carousel */
export const DISPLAY_TYPES = ["single", "gallery", "carousel"] as const;

/** Carousel effects */
export const CAROUSEL_EFFECTS = ["slide", "fade"] as const;

export const EMPTY_SLOT: SiteImage = {
  id: 0,
  section: "home",
  slotKey: "",
  label: "",
  url: "",
  altText: null,
  displayType: "single",
  sortOrder: 0,
};

/** Section labels for UI (capitalized, human-readable) */
export const SECTIONS = PAGE_SECTIONS.map((s) =>
  s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
);

/** Default slot definitions per page. Used by seed and Add Slot. */
export const SLOT_DEFINITIONS: Record<string, { slotKey: string; label: string }[]> = {
  home: [
    { slotKey: "hero", label: "Hero Banner" },
    { slotKey: "gallery", label: "Gallery (carousel/grid)" },
  ],
  about: [{ slotKey: "team", label: "Team / About" }],
  services: [{ slotKey: "hero", label: "Services Hero" }],
  "residential-turf": [{ slotKey: "hero", label: "Residential Turf Hero" }],
  "putting-green": [{ slotKey: "hero", label: "Putting Green Hero" }],
  "pet-turf": [{ slotKey: "hero", label: "Pet Turf Hero" }],
  "commercial-turf": [{ slotKey: "hero", label: "Commercial Turf Hero" }],
  pavers: [{ slotKey: "hero", label: "Pavers Hero" }],
  "drainage-grading": [{ slotKey: "hero", label: "Drainage & Grading Hero" }],
  "grass-removal": [{ slotKey: "hero", label: "Grass Removal Hero" }],
  portfolio: [{ slotKey: "hero", label: "Portfolio Hero" }],
  contact: [{ slotKey: "hero", label: "Contact Hero" }],
  blog: [{ slotKey: "cover", label: "Blog Default Cover" }],
};
