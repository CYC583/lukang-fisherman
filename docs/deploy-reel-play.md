# Reel 頁內播放 — deploy checklist

交雜事部署；本 agent 不 git push、不 deploy production。

## 問題
production（commit 7ded125）「粉專現場 · 展示廊」Reel 舞台只有靜圖＋裝飾 play icon，點了只外連 FB，手機無法頁內播。

## 修法（UX）
- `kind=reel` 舞台改 HTML5 `<video playsInline controls poster={image} src={video}>`
- 中央 play 改成真實 `<button aria-label="播放 Reel">`；點播／點舞台短觸也可播（無聲 autoplay 不做）
- 切卡自動 pause＋重設
- 「看 Reel ↗」外連 FB 保留
- 若本機 mp4 載入失敗 → fallback Facebook `plugins/video.php` iframe（仍保留外連）

## Priority paths（依序）
1. `content/showcase.json` — 5 支 Reel 加 `video: "/media/fb/showcase/reel_<id>.mp4"`
2. `public/media/fb/showcase/reel_*.mp4`（新，5 支本地檔）
   - `reel_1262430052533267.mp4`（66s，~20MB）
   - `reel_1316179553781396.mp4`（51s，~11MB）
   - `reel_1489854039217844.mp4`（9s，~0.6MB）
   - `reel_2473239573205430.mp4`（31s，~5.5MB）
   - `reel_4281959865450672.mp4`（85s，~29MB）
3. `src/lib/showcase.ts` — `ShowcaseItem.video?: string`
4. `src/components/FbShowcase.tsx` — 頁內 `<video>`＋play button＋切卡 pause＋embed fallback
5. `src/app/globals.css` — `.lf-show-video` / `.lf-show-embed` / play button z-index
6. `tests/FbShowcase.test.tsx` — reel 暴露 play／video；點播後 `data-playing=1`
7. `docs/ui-v-fb-showcase-play/*.png`（390）＋本檔

## Untouched
地球 pins／FishingMap、SoundGate、opener v4、HeroCover 雙 CTA、SiteFooter、非 Reel 展示卡內容（僅共用播放管線）

## QA
- `npm test` → 13 files / 40 tests pass
- `npm run build` → pass
- Smoke（prod @390）：點「現場 Reel」→ play → `data-playing=1`、HTML5 controls 可見；切下一則回 poster＋play；0 console/page errors
