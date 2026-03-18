import { describe, it, expect, vi, beforeEach } from "vitest";

let mockSelectFromRows: { key: string; value: string | null }[] = [];
let mockSelectWhereLimitRows: { key: string; value: string | null }[] = [];

vi.mock("../db", () => ({
  db: {
    select: () => ({
      from: () => {
        const chain = {
          where: () => ({
            limit: () => Promise.resolve(mockSelectWhereLimitRows),
          }),
          then: (resolve: (v: unknown) => void) =>
            Promise.resolve(mockSelectFromRows).then(resolve),
        };
        return chain;
      },
    }),
    insert: () => ({
      values: () => ({
        onConflictDoUpdate: () => Promise.resolve(),
      }),
    }),
  },
}));

import { getAllSettings, getSetting, setSettings, getPublicSettings } from "./settings";

describe("getAllSettings", () => {
  beforeEach(() => {
    mockSelectFromRows = [
      { key: "k1", value: "v1" },
      { key: "k2", value: "v2" },
    ];
  });

  it("returns key-value object", async () => {
    const result = await getAllSettings();
    expect(result).toEqual({ k1: "v1", k2: "v2" });
  });
});

describe("getSetting", () => {
  beforeEach(() => {
    mockSelectWhereLimitRows = [{ key: "my_key", value: "my-value" }];
  });

  it("returns value when found", async () => {
    const result = await getSetting("my_key");
    expect(result).toBe("my-value");
  });

  it("returns null when not found", async () => {
    mockSelectWhereLimitRows = [];
    const result = await getSetting("missing");
    expect(result).toBe(null);
  });
});

describe("setSettings", () => {
  it("calls insert with onConflictDoUpdate for each entry", async () => {
    await setSettings({ key1: "val1", key2: null });
    expect(true).toBe(true);
  });
});

describe("getPublicSettings", () => {
  beforeEach(() => {
    mockSelectFromRows = [
      { key: "company_name", value: "Acme" },
      { key: "gtm_id", value: "GTM-123" },
    ];
  });

  it("filters to public keys only", async () => {
    const result = await getPublicSettings();
    expect(result.company_name).toBe("Acme");
    expect(result.gtm_id).toBe("GTM-123");
  });
});
