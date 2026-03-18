export type Banner = {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  placement: string;
  bgColor: string | null;
  textColor: string | null;
  active: boolean;
  sortOrder: number;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  size: string;
  customWidth: number | null;
  customHeight: number | null;
  layout: string;
  animation: string;
  carouselGroup: string | null;
  carouselInterval: number;
  borderRadius: number;
  opacity: number;
};

export type Tab = "content" | "appearance" | "schedule";

export const PANEL_WIDTH = 240;
export const PANEL_HEIGHT_VISIBLE = 600;

export const EMPTY: Banner = {
  id: 0,
  title: "",
  subtitle: null,
  imageUrl: null,
  linkUrl: null,
  linkText: null,
  placement: "dashboard",
  bgColor: "#0f172a",
  textColor: "#ffffff",
  active: true,
  sortOrder: 0,
  startsAt: null,
  endsAt: null,
  createdAt: new Date(),
  size: "sidebar",
  customWidth: null,
  customHeight: null,
  layout: "card",
  animation: "fade",
  carouselGroup: null,
  carouselInterval: 5,
  borderRadius: 12,
  opacity: 100,
};
