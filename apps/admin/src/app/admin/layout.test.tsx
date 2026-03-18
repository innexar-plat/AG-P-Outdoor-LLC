import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRedirect = vi.fn();
const mockGetSession = vi.fn();
const mockListActiveBanners = vi.fn();
const mockGetUserById = vi.fn();

vi.mock("next/headers", () => ({
  headers: () => Promise.resolve(new Headers()),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error("NEXT_REDIRECT");
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

vi.mock("@/lib/queries/banners", () => ({
  listActiveBanners: (...args: unknown[]) => mockListActiveBanners(...args),
}));

vi.mock("@/lib/queries/users", () => ({
  getUserById: (...args: unknown[]) => mockGetUserById(...args),
}));

vi.mock("@/lib/modules", () => ({
  parseAllowedModules: (role: string) =>
    role === "admin" ? ["dashboard", "users"] : ["dashboard"],
}));

vi.mock("@/components/admin/Sidebar", () => ({
  Sidebar: ({ role }: { role: string }) => <div data-testid="sidebar">Sidebar {role}</div>,
}));

vi.mock("@/components/admin/MobileNav", () => ({
  MobileNav: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mobile-nav">{children}</div>
  ),
}));

vi.mock("@/components/admin/RightPanel", () => ({
  RightPanel: () => <div data-testid="right-panel">RightPanel</div>,
}));

import AdminLayout from "./layout";

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListActiveBanners.mockResolvedValue([]);
    mockGetUserById.mockResolvedValue({ id: "1", role: "admin", allowedModules: null });
  });

  it("redirects to /admin/login when no session", async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(AdminLayout({ children: <div>Child</div> })).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
  });

  it("renders layout when session exists", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    const result = await AdminLayout({ children: React.createElement("div", null, "Child") });
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockGetUserById).toHaveBeenCalledWith("user-1");
    expect(mockListActiveBanners).toHaveBeenCalledWith("dashboard");
    expect(result).toBeDefined();
  });
});
