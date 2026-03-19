"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const POLL_INTERVAL_MS = 20_000;

/** Bell icon with unread count badge. Polls for new leads and links to Forms. */
export function NotificationsBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/admin/api/admin/notifications/count");
      if (res.ok) {
        const json = await res.json();
        const count = json.data?.unreadCount ?? 0;
        setUnreadCount(count);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const timer = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchCount]);

  // Refetch when navigating to forms
  useEffect(() => {
    if (pathname === "/admin/forms") fetchCount();
  }, [pathname, fetchCount]);

  return (
    <Link
      href="/admin/forms"
      className="relative flex items-center justify-center rounded-lg p-2 text-sidebar-text hover:bg-white/5 hover:text-sidebar-text-active transition-colors"
      aria-label={unreadCount > 0 ? `${unreadCount} unread leads` : "Notifications"}
    >
      <BellIcon />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

function BellIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
}
