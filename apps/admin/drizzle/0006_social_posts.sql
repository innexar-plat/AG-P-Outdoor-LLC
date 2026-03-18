CREATE TABLE IF NOT EXISTS `social_posts` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `platform` text NOT NULL,
  `post_url` text NOT NULL,
  `embed_html` text,
  `title` text,
  `thumbnail_url` text,
  `published_at` integer,
  `pinned` integer NOT NULL DEFAULT 0,
  `sort_order` integer NOT NULL DEFAULT 0,
  `created_at` integer NOT NULL
);
