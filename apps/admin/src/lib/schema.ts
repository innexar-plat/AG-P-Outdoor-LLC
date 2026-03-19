import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";

/**
 * Better Auth compatible user table. role is custom (admin | editor).
 */
/**
 * Available modules that can be enabled per editor user.
 * Admin always has access to all.
 */
export const ALL_MODULES = [
  "dashboard",
  "analytics",
  "blog",
  "portfolio",
  "testimonials",
  "forms",
  "images",
  "banners",
  "seo",
  "pixels",
  "settings",
  "users",
  "social",
  "api-docs",
] as const;

export type ModuleKey = (typeof ALL_MODULES)[number];

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("editor"),
  allowedModules: text("allowed_modules"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const blogPosts = sqliteTable("blog_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const formSubmissions = sqliteTable("form_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  formType: text("form_type", { enum: ["contact", "quote", "callback"] }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  metadata: text("metadata"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
});

export const siteImages = sqliteTable("site_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  section: text("section").notNull(),
  slotKey: text("slot_key").notNull().unique(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  displayType: text("display_type", { enum: ["single", "gallery", "carousel"] }).notNull().default("single"),
  sortOrder: integer("sort_order").notNull().default(0),
  carouselItems: text("carousel_items"),
  carouselInterval: integer("carousel_interval"),
  carouselEffect: text("carousel_effect"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

/**
 * Banner size presets.
 * leaderboard: 728x90, banner: 468x60, medium_rectangle: 300x250,
 * half_page: 300x600, large_rectangle: 336x280, full_width: 100%x auto,
 * sidebar: fits right panel width, custom: user-defined
 */
export const BANNER_SIZES = [
  "leaderboard",
  "banner",
  "medium_rectangle",
  "half_page",
  "large_rectangle",
  "full_width",
  "sidebar",
  "custom",
] as const;

export type BannerSize = (typeof BANNER_SIZES)[number];

export const BANNER_SIZE_DIMENSIONS: Record<BannerSize, { w: number | null; h: number | null; label: string }> = {
  leaderboard:       { w: 728,  h: 90,  label: "Leaderboard (728×90)" },
  banner:            { w: 468,  h: 60,  label: "Banner (468×60)" },
  medium_rectangle:  { w: 300,  h: 250, label: "Medium Rectangle (300×250)" },
  half_page:         { w: 300,  h: 600, label: "Half Page (300×600)" },
  large_rectangle:   { w: 336,  h: 280, label: "Large Rectangle (336×280)" },
  full_width:        { w: null, h: null, label: "Full Width (100%)" },
  sidebar:           { w: 240,  h: null, label: "Sidebar (panel width)" },
  custom:            { w: null, h: null, label: "Custom" },
};

export const BANNER_ANIMATIONS = ["none", "fade", "slide", "zoom", "pulse"] as const;
export type BannerAnimation = (typeof BANNER_ANIMATIONS)[number];

export const BANNER_LAYOUTS = ["image_only", "text_overlay", "text_below", "text_left", "text_right", "card"] as const;
export type BannerLayout = (typeof BANNER_LAYOUTS)[number];

export const banners = sqliteTable("banners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url"),
  linkUrl: text("link_url"),
  linkText: text("link_text"),
  placement: text("placement", { enum: ["dashboard", "site_header", "site_footer", "site_popup"] }).notNull().default("dashboard"),
  bgColor: text("bg_color"),
  textColor: text("text_color"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  startsAt: integer("starts_at", { mode: "timestamp" }),
  endsAt: integer("ends_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  size: text("size").notNull().default("sidebar"),
  customWidth: integer("custom_width"),
  customHeight: integer("custom_height"),
  layout: text("layout").notNull().default("card"),
  animation: text("animation").notNull().default("fade"),
  carouselGroup: text("carousel_group"),
  carouselInterval: integer("carousel_interval").notNull().default(5),
  borderRadius: integer("border_radius").notNull().default(12),
  opacity: integer("opacity").notNull().default(100),
});

export const portfolioItems = sqliteTable("portfolio_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category", { enum: ["residential", "commercial", "sports"] }),
  imageUrl: text("image_url").notNull(),
  beforeImageUrl: text("before_image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  visible: integer("visible", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  location: text("location"),
  photoUrl: text("photo_url"),
  text: text("text").notNull(),
  rating: integer("rating").notNull().default(5),
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const testimonialImages = sqliteTable("testimonial_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  testimonialId: integer("testimonial_id")
    .notNull()
    .references(() => testimonials.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const SOCIAL_PLATFORMS = ["youtube", "instagram", "facebook", "twitter", "tiktok", "linkedin"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const socialPosts = sqliteTable("social_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  platform: text("platform").notNull(),
  postUrl: text("post_url").notNull(),
  embedHtml: text("embed_html"),
  title: text("title"),
  thumbnailUrl: text("thumbnail_url"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const pageSeo = sqliteTable("page_seo", {
  pageKey: text("page_key").primaryKey(),
  titleTag: text("title_tag"),
  metaDescription: text("meta_description"),
  ogImage: text("og_image"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const pageViews = sqliteTable("page_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pagePath: text("page_path").notNull(),
  sessionId: text("session_id"),
  referrer: text("referrer"),
  deviceCategory: text("device_category"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
