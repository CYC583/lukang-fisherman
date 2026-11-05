# Globe v1 — deploy paths（勿 git push 由本 agent；交雜事）

## Stack
- `react-globe.gl` + `three`（client-only dynamic import）
- 已移除 `leaflet`

## Flow
SoundGate → v4 opener → 首屏 FB＋痞客邦 → **釣場地球** → **裝備牆** → 頁底製作人

## Changed / new paths
- `package.json` / `package-lock.json`（+react-globe.gl +three；−leaflet）
- `content/gear.json`（新）
- `content/site.json`（mapCta／storyCta）
- `src/lib/content.ts`（getGear / getSpeciesAtlas / relatedSpots）
- `src/components/FishingMap.tsx`（整檔重寫：3D globe、多段飛入、淡金弧、潮汐條、魚種圖鑑）
- `src/components/GearWall.tsx`（新）
- `src/components/SoundAura.tsx`（新）
- `src/components/HeroCover.tsx`（#gear）
- `src/components/SiteFooter.tsx`（暗底銜接）
- `src/app/page.tsx`（砍 SeaLogbook／MemoryPostcards；加 GearWall／SoundAura）
- `src/app/globals.css`（砍 leaflet；globe／gear 樣式）
- `public/media/globe/earth-dark.jpg`
- `public/media/globe/earth-topology.png`
- `tests/*`（FishingMap mock globe、GearWall、StorySection）
- `vitest.setup.ts`（ResizeObserver）
- `docs/ui-v-globe/*.png`（390 截圖）

## Untouched
- `public/media/opener-montage.mp4`（及 v4 備份）

## QA
- `npm test` pass
- `npm run build` pass
- Pins = `content/spots.json` 筆數（目前 22）
- Mobile：OrbitControls 預設 touch rotate + pinch zoom
