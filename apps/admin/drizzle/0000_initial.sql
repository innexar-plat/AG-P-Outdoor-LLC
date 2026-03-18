-- Migration: initial schema (user, session, account, verification, blog_posts, form_submissions, settings)
-- Date: 2025-03-15
-- Reason: Admin panel with auth, blog, forms, settings

CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "email_verified" integer NOT NULL DEFAULT 0,
  "image" text,
  "role" text NOT NULL DEFAULT 'editor',
  "created_at" integer NOT NULL,
  "updated_at" integer NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY NOT NULL,
  "expires_at" integer NOT NULL,
  "token" text NOT NULL UNIQUE,
  "created_at" integer NOT NULL,
  "updated_at" integer NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY NOT NULL,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" integer,
  "refresh_token_expires_at" integer,
  "scope" text,
  "password" text,
  "created_at" integer NOT NULL,
  "updated_at" integer NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" integer NOT NULL,
  "created_at" integer,
  "updated_at" integer
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "blog_posts" (
  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  "title" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "content" text NOT NULL,
  "cover_image" text,
  "meta_title" text,
  "meta_description" text,
  "status" text NOT NULL DEFAULT 'draft',
  "published_at" integer,
  "created_at" integer NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "form_submissions" (
  "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  "form_type" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "message" text,
  "metadata" text,
  "read" integer NOT NULL DEFAULT 0,
  "created_at" integer NOT NULL
);
--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "settings" (
  "key" text PRIMARY KEY NOT NULL,
  "value" text
);
