import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

describe("design tokens", () => {
  it("defines Japanese paper+gold palette", () => {
    const css = readFileSync(resolve("src/styles/tokens.css"), "utf8");
    expect(css).toContain("#F4F1EA");
    expect(css).toContain("#C6A75E");
    expect(css).toContain("#0B1C2C");
  });
});
