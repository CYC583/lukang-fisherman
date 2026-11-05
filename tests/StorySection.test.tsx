import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
afterEach(cleanup);
import { StorySection } from "@/components/StorySection";
import { SiteFooter } from "@/components/SiteFooter";

describe("StorySection", () => {
  it("places blog CTA after stories", () => {
    render(<StorySection />);
    const blog = screen.getByRole("link", { name: "看更多釣行紀錄" });
    const storyHeading = screen.getAllByRole("heading")[0];
    expect(blog.compareDocumentPosition(storyHeading) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });
  it("has #story anchor and cast can be skipped", () => {
    const { container } = render(<StorySection />);
    expect(container.querySelector("#story")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "略過拋竿" }));
    expect(screen.getByText(/上鉤/)).toBeTruthy();
  });
  it("renders video media", () => {
    const { container } = render(<StorySection />);
    expect(container.querySelector('video[src="/media/story-reef-dawn.mp4"]')).toBeTruthy();
  });
});

describe("SiteFooter", () => {
  it("shows exact credit", () => {
    render(<SiteFooter />);
    expect(screen.getByText("製作人：愛爸爸的女兒C")).toBeTruthy();
  });
});
