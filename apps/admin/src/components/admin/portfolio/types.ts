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

/** Fallback images shown on site when portfolio is empty. Same as GalleryPage FALLBACK_GALLERY. */
export const SITE_FALLBACK: { url: string; title: string; category: string }[] = [
  { url: "https://images.unsplash.com/photo-1587936491365-48f95355007f", title: "Residential Backyard Turf", category: "Residential" },
  { url: "https://images.unsplash.com/photo-1682173044097-d14202e43fe3", title: "Custom Putting Green", category: "Putting Green" },
  { url: "https://images.unsplash.com/photo-1581062778574-8ce5c4db882", title: "Pet-Friendly Installation", category: "Pet Turf" },
  { url: "https://images.unsplash.com/photo-1578133231222-537ed648fae9", title: "Commercial Landscape", category: "Commercial" },
  { url: "https://images.unsplash.com/photo-1593177326901-7b65560a0c9b", title: "Modern Outdoor Space", category: "Residential" },
  { url: "https://images.unsplash.com/photo-1617123705211-63e0a4daec4f1", title: "Backyard Transformation", category: "Residential" },
];
