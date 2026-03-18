-- Add carousel support to site_images
-- If migrate fails with "duplicate column" (e.g. after db:push), run: npm run db:migrate-carousel
ALTER TABLE `site_images` ADD COLUMN `carousel_items` text;
--> statement-breakpoint
ALTER TABLE `site_images` ADD COLUMN `carousel_interval` integer;
--> statement-breakpoint
ALTER TABLE `site_images` ADD COLUMN `carousel_effect` text;
