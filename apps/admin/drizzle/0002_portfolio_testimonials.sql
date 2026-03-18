CREATE TABLE IF NOT EXISTS `portfolio_items` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `description` text,
  `category` text,
  `image_url` text NOT NULL,
  `before_image_url` text,
  `sort_order` integer NOT NULL DEFAULT 0,
  `visible` integer NOT NULL DEFAULT 1,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `location` text,
  `photo_url` text,
  `text` text NOT NULL,
  `rating` integer NOT NULL DEFAULT 5,
  `approved` integer NOT NULL DEFAULT 0,
  `sort_order` integer NOT NULL DEFAULT 0,
  `created_at` integer NOT NULL
);
