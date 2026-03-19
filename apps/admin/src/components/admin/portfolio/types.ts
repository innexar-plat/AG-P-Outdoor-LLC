export type PortfolioItem = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  imageUrl: string;
  beforeImageUrl: string | null;
  sortOrder: number;
  visible: boolean;
  createdAt: Date;
};

export const EMPTY: PortfolioItem = {
  id: 0,
  title: "",
  description: "",
  category: "residential",
  imageUrl: "",
  beforeImageUrl: null,
  sortOrder: 0,
  visible: true,
  createdAt: new Date(),
};

/** Fallback images - DEPRECATED: No longer used. Portfolio shows real items only. */
export const SITE_FALLBACK: { url: string; title: string; category: string }[] = [];
