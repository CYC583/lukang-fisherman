# Globe IX v2 + 磯路星圖（取代裝備牆）— deploy checklist

交雜事部署；本 agent 不 git push、不 deploy production。

## Flow（production 頁序）
SoundGate → v4 opener → 首屏 FB＋痞客邦 → **釣場地球（互動 v2）** → **釣場航跡 · 磯路星圖（新）** → 頁底「製作人：愛爸爸的女兒C」
（裝備牆已自頁面移除；GearWall.tsx / content/gear.json / 裝備圖檔留在 repo 未使用，不刪）

## Changed / new paths（priority 順序）
1. `src/components/FishingMap.tsx` — 地球互動 v2（rAF 3 段飛行、弧線 draw/morph/collapse、面板 settle 後才進、HUD、focus reticle、柔性自轉、拖轉/捏放增益、pin 不重建）
2. `src/lib/globeFly.ts`（新）— 飛行 choreography 純函式（lift → great-circle pan → dive + soft overshoot）
3. `src/components/RouteConstellation.tsx`（新）— 釣場航跡 · 磯路星圖
4. `src/lib/routes.ts`（新）— 從 spots.json 推導航段（共同魚種 MST、鹿港為根）＋ 地球⇄星圖事件
5. `src/app/page.tsx` — `<GearWall />` → `<RouteConstellation />`
6. `src/app/globals.css` — globe pin/HUD/reticle/panel 動效 + `.lf-routes*` 星圖樣式（gear 樣式未動，只是不再使用）
7. `content/site.json` — `storyCta`：看裝備牆 → 看磯路星圖
8. `src/components/HeroCover.tsx` — 第三層安靜連結 `#gear` → `#routes`（僅 href；FB／痞客邦雙 CTA 不動）
9. tests：`tests/FishingMap.test.tsx`、`tests/globeFly.test.ts`（新）、`tests/RouteConstellation.test.tsx`（新）、`tests/StorySection.test.tsx`、`tests/HeroCta.test.tsx`
10. `docs/ui-v-globe-ix/*.png`（390 截圖）、`docs/deploy-globe-ix.md`

## Untouched
SoundGate、IntroOverlay／opener v4 媒體、SiteFooter 文案、spots.json（22 pins、postUrl）、GearWall.tsx／gear.json／裝備圖（未刪，僅不上頁）、SeaLogbook／MemoryPostcards（仍不上頁）

## QA
- `npm test` → 11 files / 31 tests pass
- `npm run build` → pass
- Smoke (prod build @390, headless Chrome)：0 console/page errors
- 點星點 → 頁面捲到地球並飛入；地球選點 → 星圖同步高亮
