import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("design tokens", () => {
  it("defines Japanese paper+gold palette", () => {
    const css = readFileSync(resolve("src/styles/tokens.css"), "utf8");
    expect(css).toContain("#F7F4ED");
    expect(css).toContain("#C5A059");
    expect(css).toContain("#0B1C2C");
    expect(css).toContain("Noto Serif JP");
  });
});
