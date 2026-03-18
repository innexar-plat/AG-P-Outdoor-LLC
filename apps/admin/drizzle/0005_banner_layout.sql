-- Banner layout, size, animation, carousel fields
ALTER TABLE `banners` ADD COLUMN `size` text NOT NULL DEFAULT 'sidebar';
--> statement-breakpoint
ALTER TABLE `banners` ADD COLUMN `custom_width` integer;
--> statement-breakpoint
ALTER TABLE `banners` ADD COLUMN `custom_height` integer;
--> statement-breakpoint
ALTER TABLE `banners` ADD COLUMN `layout` text NOT NULL DEFAULT 'card';
--> statement-breakpoint
ALTER TABLE `banners` ADD COLUMN `animation` text NOT NULL DEFAULT 'fade';
--> statement-breakpoint
ALTER TABLE `banners` ADD COLUMN `carousel_group` text;
--> statement-breakpoint
ALTER TABLE `banners` ADD COLUMN `carousel_interval` integer NOT NULL DEFAULT 5;
--> statement-breakpoint
ALTER TABLE `banners` ADD COLUMN `border_radius` integer NOT NULL DEFAULT 12;
--> statement-breakpoint
ALTER TABLE `banners` ADD COLUMN `opacity` integer NOT NULL DEFAULT 100;
