# 鹿港漁人 NFC 落地頁 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建一個手機優先、日式紙白＋霧金風格的單頁站 `lukang-fisherman`，掃 NTAG216 後可立刻加入粉專，也可往下看互動漁人故事（結束後才出部落格），部署到使用者的 Vercel。

**Architecture:** Next.js App Router 靜態優先單頁；內容與連結放 `content/` JSON；開場／故事／音訊為獨立 client 元件；動畫用 CSS＋Framer Motion；部署用 Vercel 專案名 `lukang-fisherman`。

**Tech Stack:** Next.js 15、React 19、TypeScript、Tailwind CSS 4（或 3）、Framer Motion、Vitest＋Testing Library、Vercel

## Global Constraints

- 手機直式為第一優先；桌面只做合理放大，不另做複雜桌面版。
- 文案繁體中文；不寫生日；頁底固定「製作人：愛爸爸的女兒C」。
- 只用粉專／痞客邦公開內容；不放粉專外個資。
- 主 CTA 文案固定「加入鹿港漁人」「看漁人故事」；故事結束後才出現部落格 CTA。
- 開場可略過；音訊需使用者手勢或明顯靜音；遵守自動播放政策。
- 配色：紙白 `#F4F1EA`、深靛 `#0B1C2C`、炭黑 `#1A1A1A`、霧金 `#C6A75E`、海霜 `#7FB8A8`。
- 粉專 URL：`https://www.facebook.com/people/鹿港漁人/100063821466190/`
- 部落格 URL：`https://nokia1301471980.pixnet.net/blog`
- 專案／Vercel 名稱：`lukang-fisherman`

---

## File Structure

```
lukang-fisherman/
  content/
    site.json                 # 標題、連結、署名
    stories.json              # 故事章節文案與媒體路徑
  public/
    media/                    # 靜態圖／短影片／配樂（之後 curation）
    favicon.ico
  src/
    app/
      layout.tsx
      page.tsx
      globals.css
    components/
      SkipIntro.tsx
      IntroOverlay.tsx
      HeroCta.tsx
      StorySection.tsx
      CastInteraction.tsx
      BlogCta.tsx
      SiteFooter.tsx
      MuteToggle.tsx
      AmbientAudio.tsx
    lib/
      content.ts              # 讀取 JSON 的 typed helpers
      urls.ts
    styles/
      tokens.css              # CSS 變數色票
  tests/
    content.test.ts
    urls.test.ts
    HeroCta.test.tsx
    StorySection.test.tsx
  docs/superpowers/...
  package.json
  next.config.ts
  vercel.json                 # 可選
  README.md
```

---

### Task 1: Scaffold Next.js 專案與設計 token

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/styles/tokens.css`, `vitest.config.ts`, `README.md`
- Test: `tests/tokens-smoke.test.ts`

**Interfaces:**
- Produces: CSS 變數 `--color-paper`, `--color-indigo`, `--color-charcoal`, `--color-gold`, `--color-seafoam`；根 layout 設 `lang="zh-Hant"`、viewport mobile。

- [ ] **Step 1: 建立 Next.js + TS + Tailwind + Vitest**

在 `/workspace/lukang-fisherman`（若已有 docs 則在同目錄 scaffold，勿覆蓋 docs）：

```bash
cd /workspace/lukang-fisherman
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --yes
npm install framer-motion
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

若目錄非空導致 create-next-app 拒絕，改手動寫 `package.json` 最小依賴並 `npm i`。

- [ ] **Step 2: 寫 tokens 與失敗測試**

`src/styles/tokens.css`:

```css
:root {
  --color-paper: #F4F1EA;
  --color-indigo: #0B1C2C;
  --color-charcoal: #1A1A1A;
  --color-gold: #C6A75E;
  --color-seafoam: #7FB8A8;
}
```

`tests/tokens-smoke.test.ts`:

```ts
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
```

- [ ] **Step 3: 跑測試確認通過**

```bash
npx vitest run tests/tokens-smoke.test.ts
```

Expected: PASS

- [ ] **Step 4: layout 設繁中與手機 viewport**

`src/app/layout.tsx` 使用 `lang="zh-Hant"`，metadata title `鹿港漁人`，description 不提生日／個資。`globals.css` import tokens，body 背景 `--color-paper`、文字 `--color-indigo`。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold lukang-fisherman with design tokens"
```

---

### Task 2: 內容 JSON 與 typed loaders

**Files:**
- Create: `content/site.json`, `content/stories.json`, `src/lib/content.ts`, `src/lib/urls.ts`
- Test: `tests/content.test.ts`, `tests/urls.test.ts`

**Interfaces:**
- Produces:
  - `getSite(): { title: string; facebookUrl: string; blogUrl: string; footerCredit: string; primaryCta: string; storyCta: string; blogCta: string }`
  - `getStories(): Array<{ id: string; title: string; body: string; media?: { type: "image"|"video"; src: string; alt: string } }>`
  - `FACEBOOK_URL`, `BLOG_URL` constants in `urls.ts`

- [ ] **Step 1: 寫失敗測試**

`tests/urls.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { FACEBOOK_URL, BLOG_URL } from "@/lib/urls";

describe("urls", () => {
  it("points to public fan page and pixnet blog", () => {
    expect(FACEBOOK_URL).toBe(
      "https://www.facebook.com/people/%E9%B9%BF%E6%B8%AF%E6%BC%81%E4%BA%BA/100063821466190/"
    );
    // Also accept non-encoded form if implementation chooses decodeURIComponent compare:
    expect(decodeURIComponent(FACEBOOK_URL)).toContain("鹿港漁人");
    expect(BLOG_URL).toBe("https://nokia1301471980.pixnet.net/blog");
  });
});
```

`tests/content.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getSite, getStories } from "@/lib/content";

describe("content", () => {
  it("exposes required CTAs and credit", () => {
    const site = getSite();
    expect(site.title).toBe("鹿港漁人");
    expect(site.primaryCta).toBe("加入鹿港漁人");
    expect(site.storyCta).toBe("看漁人故事");
    expect(site.footerCredit).toBe("製作人：愛爸爸的女兒C");
  });

  it("has at least three story chapters", () => {
    expect(getStories().length).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 2: 跑測確認失敗**

```bash
npx vitest run tests/urls.test.ts tests/content.test.ts
```

Expected: FAIL (module not found)

- [ ] **Step 3: 實作 JSON 與 loaders**

`content/site.json`:

```json
{
  "title": "鹿港漁人",
  "facebookUrl": "https://www.facebook.com/people/鹿港漁人/100063821466190/",
  "blogUrl": "https://nokia1301471980.pixnet.net/blog",
  "footerCredit": "製作人：愛爸爸的女兒C",
  "primaryCta": "加入鹿港漁人",
  "storyCta": "看漁人故事",
  "blogCta": "看更多釣行紀錄"
}
```

`content/stories.json`：至少三章（對智／遠征／現在），文案改寫自公開素材，不寫個資；`media` 可先留 placeholder 路徑。

`src/lib/urls.ts` 與 `src/lib/content.ts` 讀取上述 JSON（`import site from "../../content/site.json"` 等）。

- [ ] **Step 4: 跑測通過並 commit**

```bash
npx vitest run tests/urls.test.ts tests/content.test.ts
git add content src/lib tests && git commit -m "feat: add site and story content loaders"
```

---

### Task 3: Hero CTA（立刻加入粉專）

**Files:**
- Create: `src/components/HeroCta.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/HeroCta.test.tsx`

**Interfaces:**
- Consumes: `getSite()`
- Produces: 主連結 `target="_blank" rel="noopener noreferrer"` 至粉專；次按鈕 `href="#story"` 或 `onClick` scrollIntoView

- [ ] **Step 1: 寫測試**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HeroCta } from "@/components/HeroCta";

describe("HeroCta", () => {
  it("shows join fan page as primary and story as secondary", () => {
    render(<HeroCta />);
    const join = screen.getByRole("link", { name: "加入鹿港漁人" });
    expect(join).toHaveAttribute("href", expect.stringContaining("facebook.com"));
    expect(screen.getByRole("link", { name: "看漁人故事" })).toHaveAttribute("href", "#story");
  });
});
```

- [ ] **Step 2: 實作 `HeroCta`（霧金主按鈕、紙白底）並掛上 `page.tsx` 首屏**

- [ ] **Step 3: 測過 + commit**

```bash
npx vitest run tests/HeroCta.test.tsx
git add src/components/HeroCta.tsx src/app/page.tsx tests/HeroCta.test.tsx
git commit -m "feat: add mobile hero CTAs for fan page and story"
```

---

### Task 4: 可略過開場 Intro

**Files:**
- Create: `src/components/IntroOverlay.tsx`, `src/components/SkipIntro.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `IntroOverlay` props `{ onDone: () => void }`；略過與自動結束都呼叫 `onDone`；結束後不再擋住 Hero。

- [ ] **Step 1: 實作 overlay（2–3 秒）+「略過」按鈕；`prefers-reduced-motion` 時直接 `onDone`**

- [ ] **Step 2: 手動驗收**：`npm run dev`，手機寬度下開場可略過，略過後立刻看到「加入鹿港漁人」

- [ ] **Step 3: Commit**

```bash
git add src/components/IntroOverlay.tsx src/components/SkipIntro.tsx src/app/page.tsx
git commit -m "feat: add skippable cinematic intro overlay"
```

---

### Task 5: 故事區＋拋竿小互動＋故事後部落格

**Files:**
- Create: `src/components/StorySection.tsx`, `src/components/CastInteraction.tsx`, `src/components/BlogCta.tsx`, `src/components/SiteFooter.tsx`
- Test: `tests/StorySection.test.tsx`

**Interfaces:**
- Consumes: `getStories()`, `getSite()`
- Produces: `#story` 區塊；`CastInteraction` 成功／略過都可前進；`BlogCta` 僅渲染於故事列表之後；`SiteFooter` 顯示固定署名。

- [ ] **Step 1: 測試部落格 CTA 不在故事前出現**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StorySection } from "@/components/StorySection";

describe("StorySection", () => {
  it("places blog CTA after stories", () => {
    render(<StorySection />);
    const blog = screen.getByRole("link", { name: "看更多釣行紀錄" });
    const storyHeading = screen.getAllByRole("heading")[0];
    expect(blog.compareDocumentPosition(storyHeading) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });
});
```

- [ ] **Step 2: 實作章節捲動、CastInteraction（滑動即可，不依賴裝置陀螺儀為必須）、BlogCta、Footer**

- [ ] **Step 3: 測過 + commit**

```bash
npx vitest run tests/StorySection.test.tsx
git add src/components tests/StorySection.test.tsx
git commit -m "feat: add interactive story section and post-story blog CTA"
```

---

### Task 6: 配樂與靜音

**Files:**
- Create: `src/components/AmbientAudio.tsx`, `src/components/MuteToggle.tsx`
- Add: `public/media/ambient.mp3`（免版稅；若尚未選定，放 README 說明佔位並用短 silent／海浪樣本）

**Interfaces:**
- Produces: 預設靜音或需一次點擊才播放；右下角靜音鈕永遠可見；不自動大聲外放。

- [ ] **Step 1: 實作 `AmbientAudio`＋`MuteToggle`，掛在 layout／page**

- [ ] **Step 2: 手動驗收自動播放政策（iOS Safari 模擬：未手勢不吵）**

- [ ] **Step 3: Commit**

```bash
git add src/components/AmbientAudio.tsx src/components/MuteToggle.tsx public/media README.md
git commit -m "feat: add optional ambient audio with mute control"
```

---

### Task 7: 媒體 curation 佔位與 README

**Files:**
- Modify: `content/stories.json`, `README.md`
- Create: `public/media/.gitkeep`

- [ ] **Step 1: README 寫清：如何替換粉專圖／短影片、NFC 寫入網址、授權注意**

- [ ] **Step 2: Commit**

```bash
git add content/stories.json public/media README.md
git commit -m "docs: media placeholders and NFC deploy notes"
```

---

### Task 8: Vercel 建立專案並部署

**Files:** none（遠端）

**Interfaces:**
- Uses Vercel team `team_5PjEelQXux3GIeCk4LXY42yE`；專案名 `lukang-fisherman`

- [ ] **Step 1: `npm run build` 本地成功**

```bash
npm run build
```

Expected: exit 0

- [ ] **Step 2: 用 Vercel MCP／CLI 建立專案並部署**

優先：`create_project` name=`lukang-fisherman` + `create_deployment`（或 `vercel --prod` 若已登入 CLI）。回傳正式 URL。

- [ ] **Step 3: 手機實機打開 URL，勾選規格驗收清單**

- [ ] **Step 4: 把正式 HTTPS URL 寫進 README「NFC 寫入」段落並 commit

```bash
git add README.md && git commit -m "docs: record production URL for NTAG216"
```

---

## Spec coverage (self-review)

| Spec 需求 | Task |
|---|---|
| 手機優先／日式紙白霧金 | 1 |
| 開場可略過 | 4 |
| 加入粉專＋看漁人故事 | 3 |
| 故事互動＋結束後部落格 | 5 |
| 署名 | 5 |
| 只用公開內容 | 2、7 |
| 配樂可靜音 | 6 |
| Vercel `lukang-fisherman` | 8 |
| NTAG216 | 7、8 |

無 TBD／TODO 佔位步驟；URL 與 CTA 文案與規格一致。
