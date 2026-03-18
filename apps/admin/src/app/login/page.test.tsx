/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: vi.fn(),
}));

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    t: (key: string) =>
      ({
        welcomeBack: "Welcome back",
        signInSubtitle: "Sign in to your account",
        email: "Email",
        password: "Password",
        signIn: "Sign in",
        signingIn: "Signing in...",
        invalidCredentials: "Invalid credentials",
        connectionError: "Connection error",
        secureAccess: "Secure access",
        adminPanel: "Admin Panel",
      })[key] ?? key,
  }),
}));

vi.mock("@/components/ui/Logo", () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}));

vi.mock("@/components/ui/Button", () => ({
  Button: ({
    children,
    type,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    type?: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type={type as "button" | "submit"} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/Input", () => ({
  Input: ({
    label,
    type,
    value,
    onChange,
    placeholder,
  }: {
    label: string;
    type: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    placeholder?: string;
  }) => (
    <div>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        data-testid={type === "email" ? "email-input" : "password-input"}
      />
    </div>
  ),
}));

vi.mock("@/components/ui/LanguageSelector", () => ({
  LanguageSelector: () => <div data-testid="language-selector">Language</div>,
}));

import LoginPage from "./page";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSearchParams).mockReturnValue({
      get: () => null,
    } as ReturnType<typeof useSearchParams>);
  });

  it("renders login form with email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows error when login fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Invalid email or password" }),
    });

    render(<LoginPage />);
    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
  });

  it("redirects to admin dashboard on successful login", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(<LoginPage />);
    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("redirects to callbackUrl when provided and valid", async () => {
    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === "callbackUrl" ? "/admin/forms" : null),
    } as ReturnType<typeof useSearchParams>);

    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    render(<LoginPage />);
    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/forms");
    });
  });
});
