# 粉專現場 · 展示廊 + 地球 pin 校正 — deploy checklist

交雜事部署；本 agent 不 git push、不 deploy production。

## Flow（production 頁序）
SoundGate → v4 opener → 首屏 FB＋痞客邦 → **釣場地球（Taiwan lock + pin 校正）** → **粉專現場 · 展示廊（新）** → 頁底「製作人：愛爸爸的女兒C」
（磯路星圖 RouteConstellation 已自頁面移除；RouteConstellation.tsx / routes.ts 留 repo 未使用。GearWall 照舊不上頁）

## Priority paths（依序）
1. `content/spots.json` — 22 pins 全部重定座標到真實岸線（+ `coordNote` 理由欄）
2. `public/media/globe/taiwan-coast.geojson`（新）— 台灣本島＋澎湖／望安／七美／東嶼坪／龜山島／小琉球 岸線（NE 10m + OSM），所有 ring 已轉順時針
3. `src/lib/globeFly.ts` — `TAIWAN_POV`(23.66,120.76,alt 0.10) 鎖台灣本島；`DIVE_ALTITUDE` 0.42→0.04；`homeFrame`、`idleSway`（取代 auto-rotate）
4. `src/components/FishingMap.tsx` — 移除自轉（pin 不再漂東北／東海）、拖放後 5.2s 滑回台灣鎖定＋微呼吸；霧金陸地＋金色岸線 polygon；pin/point 高度壓到貼地；環/弧尺寸配合近景；「磯路星圖」鈕→「粉專現場」#showcase
5. `src/components/FbShowcase.tsx`（新）＋ `src/lib/showcase.ts`（新）＋ `content/showcase.json`（新）
6. `src/lib/globeBus.ts`（新）— 地球 fly/active 事件（routes.ts 改為 re-export）
7. `public/media/fb/showcase/reel_*.jpg`（新）— 5 支 Reel 公開 og 縮圖
8. `src/app/page.tsx` — `<RouteConstellation />` → `<FbShowcase />`
9. `src/app/globals.css` — 新增 `.lf-show*`（星圖樣式未動、只是不再使用）
10. `content/site.json` storyCta：看磯路星圖 → 看粉專現場；`src/components/HeroCover.tsx` 第三層安靜連結 `#routes` → `#showcase`（FB／痞客邦雙 CTA 不動）
11. tests：`tests/pins.test.ts`（新）、`tests/FbShowcase.test.tsx`（新）、`tests/globeFly.test.ts`、`tests/HeroCta.test.tsx`、`tests/StorySection.test.tsx`
12. `docs/ui-v-fb-showcase/*.png`（390 截圖）、本檔

## Untouched
SoundGate、IntroOverlay／opener v4 媒體、HeroCover 雙 CTA、SiteFooter 文案、GearWall／gear.json、SeaLogbook／MemoryPostcards（仍不上頁）

## Pin 校正表
| id | 名稱 | 舊 lat,lng | 新 lat,lng | 理由 |
|---|---|---|---|---|
| `fb-02PxbAXS` | 嘉義 · 好美漁港（卵石／消波磚） | 23.351, 120.15 | 23.356, 120.128 | 好美漁港（好美寮）外堤；舊點 120.150 落在內陸布袋鎮區 |
| `fb-02iUtacK` | 本島岸磯 · 淺場（黑牛） | 24.05, 120.4 | 24.063, 120.386 | 未具名本島淺場→鹿港彰濱西岸線；舊點 120.400 在海堤內陸側 |
| `fb-0sEwGtM4` | 卵石堆迴流處 | 22.987, 120.155 | 22.992, 120.15 | 台南安平港卵石堤（OSM 安平港 22.983,120.160） |
| `fb-02seJhuG` | 粉專釣行 · 黑牛／沙格 | 23.38, 120.15 | 23.384, 120.137 | 布袋港外堤（OSM 布袋港 23.379,120.138）；舊點落布袋市區 |
| `fb-02PwVphQ` | 澎湖 · 釣行飛回 | 23.255, 119.667 | 23.259, 119.521 | 東嶼坪嶼東岸；舊點 119.667 在嶼東 ~15km 外海 |
| `pixnet-10343789171` | 澎湖南海 · 東嶼坪豬母塭 | 23.255, 119.667 | 23.2545, 119.5195 | 東嶼坪嶼（OSM 23.255,119.509–23.259,119.516）豬母塭；舊點外海 |
| `pixnet-10342115425` | 蘇澳 · 大三仙平礁 | 24.494, 121.878 | 24.598, 121.895 | 蘇澳三仙礁·平礁（南方澳東 ~2km，24°35.9′N 121°53.7′E）；舊點 24.494 在東澳外海、偏南 11km |
| `pixnet-10341125791` | 嘉義 · 布袋南堤 | 23.365, 120.145 | 23.371, 120.131 | 布袋南堤（布袋港南側堤） |
| `pixnet-10339421904` | 南部 · 波止場（黑鯛淺談） | 23.37, 120.15 | 23.366, 120.13 | 文內未具名南部波止→布袋南堤岸線；舊點在內陸 |
| `pixnet-10339189251` | 北部戰場 · 鱗海／阿天達實測 | 25.12, 121.45 | 25.182, 121.411 | 北部戰場→淡水沙崙／漁人碼頭外堤；舊點 25.12,121.45 在淡水市區內陸 |
| `pixnet-10339068909` | 嘉義 · 布袋南堤／北堤 | 23.379, 120.147 | 23.389, 120.136 | 布袋北堤 |
| `pixnet-10338846381` | 嘉義 · 布袋港（金寶螺前打） | 23.379, 120.155 | 23.38, 120.14 | 布袋港（OSM 23.379,120.138） |
| `pixnet-10337577351` | 西岸 · 冬之淺場波止 | 24.08, 120.4 | 24.073, 120.388 | 西岸淺場波止→鹿港彰濱岸線；舊點內陸 |
| `pixnet-10336318272` | 基隆方向 · 秋磯黑鯛（新點） | 25.144, 121.76 | 25.155, 121.731 | 基隆外木山海岸（OSM 25.154,121.733）；舊點 121.760 在基隆港區 |
| `pixnet-10335386250` | 西岸 · 秋磯黑鯛（流的脈動） | 24.1, 120.39 | 24.108, 120.414 | 西岸夜磯→鹿港北側（線西／鹿港區）岸線 |
| `pixnet-10333409971` | 蘇澳 · 三仙尖礁 | 24.492, 121.88 | 24.601, 121.892 | 蘇澳三仙礁·尖礁（平礁北側）；舊點偏南 11km |
| `pixnet-10332547936` | 蘇澳 · 三仙平礁 | 24.494, 121.878 | 24.596, 121.894 | 蘇澳三仙礁·平礁；舊點偏南 11km |
| `pixnet-10332051259` | 彰化 · 鹿港北堤淺灘 | 24.075, 120.415 | 24.088, 120.393 | 鹿港北堤（彰濱鹿港區北側岸堤）；舊點 120.415 在海堤內陸側 |
| `pixnet-10327877500` | 波止場 · 磯落入思維（石斑） | 24.06, 120.42 | 24.055, 120.374 | 老釣點肉粽場→鹿港南側岸線；舊點內陸 |
| `pixnet-10327423684` | 宜蘭 · 東澳烏石鼻（竹仔腳） | 24.485, 121.837 | 24.481, 121.858 | 東澳烏石鼻（OSM 24.481,121.859）；舊點 121.837 在內陸蘇花路 |
| `pixnet-10325072905` | 北海岸 · 淡水／三芝／石門沿岸 | 25.258, 121.508 | 25.292, 121.534 | 淡水—三芝—石門沿岸→石門富基漁港岸線（OSM 25.292,121.534）；舊點在三芝內陸 |
| `pixnet-10282579850` | 新北 · 八里下罟子航道 | 25.148, 121.398 | 25.144, 121.38 | 八里下罟子漁港（OSM 25.143,121.381）；舊點 121.398 在內陸 |
## 展示廊內容來源（content/showcase.json）
| 卡 | 分類 | 圖 | 外連 |
|---|---|---|---|
| 澎湖離島 · 火山岩與藍海（2026-01-25，418讚 +8圖，主視覺） | 離島 | `profile_cover_960.jpg`（暫代，待原貼圖） | 粉專主頁；「在地球上看」→ fb-02PwVphQ |
| 一小時兩尾 · 十幾斤（Reel 1262430052533267） | 現場 Reel | og 縮圖（去黑邊） | facebook.com/reel/… |
| 好美漁港 · 三斤級黑鯛（2026-10-20） | 實釣 | `post_gallery_1_590.jpg`（同場系） | 該篇 permalink＋痞客邦；在地球上看 → fb-02PxbAXS；註記「文內提及澎湖賽事取消」 |
| 2.5 小時 · 兩匹 40up 黑牛（2024-12-14） | 實釣 | `catch_pride_hand.jpg` | 該篇 permalink；在地球上看 → fb-02iUtacK |
| 休閒場小釣 · 找回手感（Reel 2473239573205430） | 現場 Reel | og 縮圖 | reel |
| 厚殼難關（2026-01-19，492讚） | 實釣 | `coast_wave.jpg`（暫代） | 粉專主頁 |
| 滿海燕魚（Reel 4281959865450672） | 現場 Reel | og 縮圖 | reel |
| 堤上現場（Reel 1316179553781396） | 現場 Reel | og 縮圖 | reel |
| 阿肥師傅帶我飛（Reel 1489854039217844） | 現場 Reel | og 縮圖 | reel |

Chips：全部／實釣／離島／現場 Reel（無「比賽」）。互動數為 2026-11-06 公開 og 快照。

## QA
- `npm test` → 13 files / 39 tests pass
- `npm run build` → pass
- Smoke（prod build @390, headless Chromium）：0 console/page errors
- 截圖：01 idle 鎖台灣、02 呼吸後仍鎖定、03 鹿港、04 布袋、05 蘇澳三仙礁、06 東嶼坪、07 烏石鼻、08 收合滑回、10–14 展示廊、15 展示廊→地球飛澎湖
