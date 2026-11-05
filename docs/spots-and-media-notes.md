# Spots & media notes

更新時間：2026-11-06 Asia/Taipei（雜事 scrape；未改 React、未 deploy、未 push）

## Hard rules（YC）
1. **1:1** — 地圖點＝公開貼文／釣行文有具名（或文內可辨）釣點者；不灌水、不拿 logbook 4 筆充數。
2. **原文連結** — 每筆必有 `postUrl`（與 `sourceUrl` 同值）。
3. **圖文綁定** — `image` 必須來自該篇文內圖（`imageSourceUrl` 可追溯）；禁止張冠李戴。

## 統計（目前對上）

| 來源 | 可列公開文／點 | 已寫入 `spots.json` | 備註 |
| --- | --- | --- | --- |
| 痞客邦釣行／釣點文 | **17** | **17** | 每筆皆有 `postUrl`＋同篇圖 |
| Facebook 粉專貼文 | **0（本輪）** | **0** | **Blocker：登入／錯誤牆** |
| **合計地圖點** | — | **17** | 全 `approx: true`（公開海岸近似座標） |

粉專 URL（僅粉專首頁，非單篇 permalink）：  
https://www.facebook.com/people/鹿港漁人/100063821466190/

### Facebook blocker
- `facebook.com` / `m.facebook.com` → HTTP 400「Sorry, something went wrong」
- `mbasic.facebook.com` → 導向登入牆，無公開貼文 HTML／`story_fbid`
- 既有本機 `public/media/fb/post_gallery_*.jpg`、`post_older_4_590.jpg` 來自粉專公開圖素材庫，**但本輪拿不到單篇 permalink**，故**不**塞進 `spots.json`（避免無 `postUrl` 違規）。
- 解法：人工作業從粉專複製各貼文 permalink，或登入後匯出後再 1:1 補 FB 點。

### 痞客邦範圍
部落格：https://nokia1301471980.pixnet.net/blog  
本輪索引＝首頁可見活動紀錄＋搜尋補到的較舊釣行文（RSS／archive 路徑空）。  
未納入：純轉載心得文（例：`10251082685` 子線轉載，無釣點）。

## `content/spots.json` 一覽（17）

| id | name | postUrl | 魚種（文內） |
| --- | --- | --- | --- |
| pixnet-10343789171 | 澎湖南海 · 東嶼坪豬母塭 | …/10343789171 | 黃雞魚、幽面、拉崙、白毛、鶴鱵、獨角天狗鯛 |
| pixnet-10342115425 | 蘇澳 · 大三仙平礁 | …/10342115425 | 白毛、幽面 |
| pixnet-10341125791 | 嘉義 · 布袋南堤 | …/10341125791 | 黑鯛、變身苦 |
| pixnet-10339421904 | 南部 · 波止場（黑鯛淺談） | …/10339421904 | 黑鯛（文內未具名堤） |
| pixnet-10339189251 | 北部戰場 · 鱗海／阿天達實測 | …/10339189251 | 黑鯛（僅「北部戰場」） |
| pixnet-10339068909 | 嘉義 · 布袋南堤／北堤 | …/10339068909 | 黑鯛 |
| pixnet-10338846381 | 嘉義 · 布袋港（金寶螺前打） | …/10338846381 | 黑鯛 |
| pixnet-10337577351 | 西岸 · 冬之淺場波止 | …/10337577351 | 黑鯛、紅鰽（未具名堤） |
| pixnet-10336318272 | 基隆方向 · 秋磯黑鯛（新點） | …/10336318272 | 黑鯛（未寫精確堤名） |
| pixnet-10335386250 | 西岸 · 秋磯黑鯛（流的脈動） | …/10335386250 | 黑鯛（未具名堤） |
| pixnet-10333409971 | 蘇澳 · 三仙尖礁 | …/10333409971 | 白毛 |
| pixnet-10332547936 | 蘇澳 · 三仙平礁 | …/10332547936 | 白毛、幽面、黑鯛 |
| pixnet-10332051259 | 彰化 · 鹿港北堤淺灘 | …/10332051259 | 黑鯛 |
| pixnet-10327877500 | 波止場 · 磯落入思維（石斑） | …/10327877500 | 石斑、紅鰽（老釣點未具名） |
| pixnet-10327423684 | 宜蘭 · 東澳烏石鼻（竹仔腳） | …/10327423684 | 雀鯛、印魚、白毛 |
| pixnet-10325072905 | 北海岸 · 淡水／三芝／石門沿岸 | …/10325072905 | 黑鯛、沙格 |
| pixnet-10282579850 | 新北 · 八里下罟子航道 | …/10282579850 | 石班、紅鰽、黑鯛、七星鱸 |

座標皆公開海岸／漁港／外礁近似，`approx: true`。文內未具名者見該筆 `placeNote`。

### 圖片注意
- 豬母塭篇 og:image 為「齊柏林／空中攝影」空拍圖 → **已略過**；改用同篇礁上搏魚圖 `pixnet_10343789171_a502533d.jpg`。
- 圖檔目錄：`public/media/fb/pixnet/pixnet_<postId>_<hash8>.jpg`（17 張，與 spots 1:1）。

## 新增／可用媒體（磯の記録／memories 去重用）

### 本輪新增（不覆蓋 gallery 原檔）
| 路徑 | 來源 | 用途建議 |
| --- | --- | --- |
| `public/media/fb/pixnet/*.jpg`（17） | 痞客邦各篇文內圖 | **僅**對應 `spots.json` 同 id；可另挑同篇其他圖進 kiroku，勿跨篇混用 |
| `public/media/fb/catch_pride_hand.jpg` | `_gen_refs/catch_pride`（hash 新） | memories／logbook 候選 |
| `public/media/fb/catch_close_t15.jpg` | `_gen_refs/catch_t15` | 漁獲近拍 |
| `public/media/fb/coast_cover_t40.jpg` | `_gen_refs/cover_t40` | 海岸／封面 |
| `public/media/fb/coast_wave.jpg` | `_gen_refs/cover_wave` | 浪打磯 |
| `public/media/fb/reef_dawn.jpg` | `_gen_refs/reef_dawn` | 磯黎明 |
| `public/media/fb/catch_ref01_hand.jpg` | `fb/refs/ref_01`（獨特 hash） | 手持漁獲 |
| `public/media/fb/catch_ref02_hand.jpg` | `fb/refs/ref_02`（獨特 hash） | 手持漁獲 |

### Hash 重複（勿當「多一張」）
| 檔 | 與誰相同 |
| --- | --- |
| `fb/refs/ref_spot_eddy.jpg` | `post_gallery_1_590.jpg` |
| `fb/refs/ref_catch_silver.jpg`、`_gen_refs/catch_fb.jpg` | `post_gallery_2_590.jpg` |
| `fb/refs/ref_yellowfin.jpg` | `post_gallery_3_590.jpg` |
| `fb/refs/ref_gear_full.jpg` | `post_older_4_590.jpg` |
| `fb/refs/ref_coast.jpg`、`_gen_refs/profile_cover.jpg` | `profile_cover_960.jpg` |
| `_gen_refs/rod_pov.jpg` | `post_gallery_1_590.jpg` |

## Draft：logbook／memories 圖片去重指派

現況問題：`logbook.json` 與 `memories.json` 共用 `post_gallery_1/2` 與 `post_older_4`。

建議（**僅筆記，本輪未改 JSON／元件**）：

| 區塊 | id | 建議 image | 理由 |
| --- | --- | --- | --- |
| logbook | eddy-black | 維持 `post_gallery_1_590.jpg` | 卵石堤釣點主視覺 |
| logbook | silver-first | 維持 `post_gallery_2_590.jpg` | 銀鱗漁獲 |
| logbook | yellow-fin | 維持 `post_gallery_3_590.jpg` | 黃鰭／金尾 |
| logbook | armed | 維持 `post_older_4_590.jpg` | 全副武裝本人 |
| memories | rod-at-eddy | → `catch_ref01_hand.jpg` 或 pixnet 鹿北篇圖 | 離開 gallery_1 |
| memories | black-porgy | → `catch_pride_hand.jpg` | 離開 gallery_2 |
| memories | master-catch | → `catch_ref02_hand.jpg` | 離開 older_4 |
| species | black-porgy | → `catch_close_t15.jpg` | 與 memories 再錯開 |
| species | yellowfin | 維持 gallery_3 或另抓黃錫鯛文圖 | — |
| species | catch-of-day | → `coast_wave.jpg`／`reef_dawn.jpg` | 氛圍圖，勿再綁 older_4 |
| guess | — | 維持 gallery_2 **或**改 `catch_pride_hand` | 若改，logbook silver 可獨佔 gallery_2 |

磯の記録擴充：優先從 `public/media/fb/pixnet/` 再抓**同篇**第二、三張（檔名加 `_2`），或等 FB permalink 解鎖後補粉專白帽／蒙面動作圖。

## Schema（給地圖／bott）
```json
{
  "id": "pixnet-<postId>",
  "name": "顯示名",
  "title": "原文標題",
  "region": "TW",
  "regionLabel": "縣市標籤",
  "lat": 0,
  "lng": 0,
  "approx": true,
  "species": ["魚種"],
  "summary": "一句公開釣行摘要",
  "season": "2017·09",
  "tags": ["磯釣"],
  "source": "pixnet",
  "sourcePlatform": "pixnet",
  "postUrl": "https://nokia1301471980.pixnet.net/blog/posts/…",
  "sourceUrl": "（同 postUrl）",
  "image": "/media/fb/pixnet/…",
  "imageSourceUrl": "https://pimg.1px.tw/…",
  "date": "YYYY-MM-DD",
  "confidence": "approximate",
  "placeNote": "optional"
}
```

## 未做
- 未改 React／未 deploy／未 git push
- 未寫入 memories／logbook 實際欄位（僅本筆記 draft）
- FB 單篇 permalink 仍缺
