/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PortfolioView } from "./portfolio";

const mockT = (key: string) =>
  ({
    portfolio: "Portfolio",
    portfolioDesc: "Manage portfolio items",
    newProject: "New project",
    noProjects: "No projects",
    siteFallback: "Site fallback",
    siteFallbackDesc: "Fallback images",
    addFromFallback: "Add from fallback",
    edit: "Edit",
    remove: "Remove",
    visible: "Visible",
    hidden: "Hidden",
    save: "Save",
    cancel: "Cancel",
    confirmRemoveProject: "Remove this project?",
    title: "Title",
    description: "Description",
    category: "Category",
    image: "Image",
    sortOrder: "Order",
  })[key] ?? key;

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({ t: mockT }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

const initialItems = [
  {
    id: 1,
    title: "Project Alpha",
    description: "A great project",
    category: "residential",
    imageUrl: "https://example.com/img1.jpg",
    beforeImageUrl: null,
    sortOrder: 1,
    visible: true,
    createdAt: new Date("2024-01-01"),
  },
];

describe("PortfolioView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("renders portfolio items", () => {
    render(<PortfolioView items={initialItems} />);
    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
  });

  it("renders empty state when no items", () => {
    render(<PortfolioView items={[]} />);
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
  });

  it("opens edit slide-over when add button is clicked", () => {
    render(<PortfolioView items={initialItems} />);
    const addBtn = screen.getByRole("button", { name: /new project/i });
    fireEvent.click(addBtn);
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });
});
