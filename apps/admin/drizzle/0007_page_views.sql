CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_path TEXT NOT NULL,
  session_id TEXT,
  referrer TEXT,
  device_category TEXT,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
