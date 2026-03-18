-- Add allowed_modules to user table (JSON string with module keys)
ALTER TABLE `user` ADD COLUMN `allowed_modules` text;
