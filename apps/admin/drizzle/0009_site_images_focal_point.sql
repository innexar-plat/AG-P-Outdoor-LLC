-- Add focal point columns to site_images for image position control
ALTER TABLE `site_images` ADD COLUMN `focal_x` integer DEFAULT 50;
--> statement-breakpoint
ALTER TABLE `site_images` ADD COLUMN `focal_y` integer DEFAULT 50;
