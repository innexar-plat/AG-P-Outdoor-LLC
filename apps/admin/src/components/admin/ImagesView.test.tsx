/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImagesView } from "./images";

const mockT = (key: string) =>
  ({
    siteImages: "Site Images",
    siteImagesDesc: "Manage site images",
    addSlot: "Add slot",
    addImage: "Add image",
    siteFallbacksMap: "Site fallbacks",
    siteFallbacksDesc: "Fallback images",
    all: "All",
    home: "Home",
    about: "About",
    services: "Services",
    portfolio: "Portfolio",
    contact: "Contact",
    section: "Section",
    label: "Label",
    url: "URL",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    remove: "Remove",
    preview: "Preview",
  })[key] ?? key;

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({ t: mockT }),
}));

const initialImages = [
  {
    id: 1,
    section: "Home",
    slotKey: "hero",
    label: "Hero banner",
    url: "https://example.com/hero.jpg",
    altText: "Hero",
    displayType: "single",
    sortOrder: 1,
  },
];

describe("ImagesView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("renders images by section", () => {
    render(<ImagesView images={initialImages} />);
    expect(screen.getByText("Site Images")).toBeInTheDocument();
    expect(screen.getAllByText("Hero banner").length).toBeGreaterThan(0);
  });

  it("renders empty state when no images", () => {
    render(<ImagesView images={[]} />);
    expect(screen.getByText("Site Images")).toBeInTheDocument();
  });

  it("renders section filter buttons", () => {
    render(<ImagesView images={initialImages} />);
    const homeButtons = screen.getAllByRole("button", { name: "Home" });
    expect(homeButtons.length).toBeGreaterThan(0);
  });
});
