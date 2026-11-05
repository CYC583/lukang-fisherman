import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { GearWall } from "@/components/GearWall";
import { SoundProvider } from "@/components/SoundContext";

afterEach(cleanup);

describe("GearWall", () => {
  it("shows interactive hotspots for signature gear", () => {
    render(
      <SoundProvider>
        <GearWall />
      </SoundProvider>,
    );
    expect(screen.getByRole("heading", { name: "裝備牆" })).toBeTruthy();
    expect(screen.getByTestId("gear-wall")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("SUNLINE"));
    expect(screen.getByTestId("gear-detail").textContent).toMatch(/SUNLINE/);
    fireEvent.click(screen.getByLabelText("LIMITED PRO"));
    expect(screen.getByTestId("gear-detail").textContent).toMatch(/LIMITED PRO/);
  });
});
