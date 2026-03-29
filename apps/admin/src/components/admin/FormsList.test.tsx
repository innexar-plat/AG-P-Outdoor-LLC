/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormsList } from "./FormsList";

const mockT = (key: string) =>
  ({
    type: "Type",
    read: "Read",
    all: "All",
    yes: "Yes",
    no: "No",
    from: "From",
    to: "To",
    filter: "Filter",
    filtering: "Filtering...",
    exportCsv: "Export CSV",
    date: "Date",
    name: "Name",
    email: "Email",
    status: "Status",
    actions: "Actions",
    noSubmissionsTable: "No submissions",
    markRead: "Mark read",
    remove: "Remove",
    submission: "Submission",
    message: "Message",
    metadata: "Metadata",
    phone: "Phone",
    newBadge: "New",
    confirmRemove: "Confirm remove?",
    leadClassification: "Lead classification",
    crmComment: "CRM comment",
    saveLead: "Save lead",
    called: "Called",
    notCalled: "Did not call",
    newLead: "New lead",
  })[key] ?? key;

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({ t: mockT }),
}));

const initialSubmissions = [
  {
    id: 1,
    formType: "contact",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    message: "Hello",
    metadata: null,
    read: false,
    leadStatus: "new",
    crmComment: null,
    createdAt: "2024-01-15",
  },
];

describe("FormsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("renders with initial submissions", () => {
    render(<FormsList initial={initialSubmissions} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("contact")).toBeInTheDocument();
  });

  it("renders empty state when no submissions", () => {
    render(<FormsList initial={[]} />);
    expect(screen.getByText("No submissions")).toBeInTheDocument();
  });

  it("opens slide-over when row is clicked", async () => {
    render(<FormsList initial={initialSubmissions} />);
    fireEvent.click(screen.getByText("John Doe"));
    expect(screen.getByText(/Submission #1/)).toBeInTheDocument();
  });

  it("calls fetch when filter button is clicked", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: initialSubmissions }),
    } as Response);

    render(<FormsList initial={initialSubmissions} />);
    fireEvent.click(screen.getByText("Filter"));
    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/admin/forms"));
    });
  });
});
