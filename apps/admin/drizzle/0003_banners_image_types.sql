-- Add display_type and sort_order to site_images
ALTER TABLE `site_images` ADD COLUMN `display_type` text NOT NULL DEFAULT 'single';
--> statement-breakpoint
ALTER TABLE `site_images` ADD COLUMN `sort_order` integer NOT NULL DEFAULT 0;
--> statement-breakpoint
-- Banners / promotions table
CREATE TABLE IF NOT EXISTS `banners` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `subtitle` text,
  `image_url` text,
  `link_url` text,
  `link_text` text,
  `placement` text NOT NULL DEFAULT 'dashboard',
  `bg_color` text,
  `text_color` text,
  `active` integer NOT NULL DEFAULT 1,
  `sort_order` integer NOT NULL DEFAULT 0,
  `starts_at` integer,
  `ends_at` integer,
  `created_at` integer NOT NULL
);
