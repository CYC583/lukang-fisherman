# 鹿港漁人 (lukang-fisherman)

給爸爸的 NTAG216 NFC 落地頁：手機優先、日式紙白＋霧金。掃標籤後立刻能加入粉專，也能往下看互動漁人故事（故事與紀念貼圖後導回粉專）。

技術：Next.js App Router + Tailwind + Vitest。部署目標專案名 `lukang-fisherman`（見 Task 8）。

## 指令

- `npm run dev` — 本機開發
- `npm test` — Vitest
- `npm run build` — 正式建置

設計 token：`src/styles/tokens.css`  
站點文案／連結：`content/site.json`  
故事章節：`content/stories.json`

## CTA 與頁面流程

| 按鈕文案 | 行為 |
| --- | --- |
| **加入鹿港漁人** | 外連 Facebook 粉專（一進來就醒目，可略過故事） |
| **看漁人故事** | 錨點 `#story`，進互動故事區 |
| **去粉專看更多釣行** | 故事＋紀念貼圖後，外連 Facebook 粉專 |

頁底署名固定：**製作人：愛爸爸的女兒C**。開場動畫可略過；進站先問要不要開啟聲音（自訂按鈕）；選開啟後影片／配樂可出聲。

## 媒體檔案（如何替換）

所有靜態媒體放在 `public/media/`（目錄已用 `.gitkeep` 保留；實際圖／片請一併 commit 或依下方說明覆蓋）。

| 路徑 | 用途 | 替換方式 |
| --- | --- | --- |
| `public/media/ambient.mp3` | 背景配樂 | **目前為佔位**：ffmpeg 合成的低通棕噪音「海浪感」循環（原創、無授權問題）。正式 BGM 請換成免版稅／可商用曲，**直接覆蓋同檔名**即可。 |
| `public/media/dad-catch-cinematic.mp4` | 故事「與黑鯛對智」 | 粉專公開漁獲圖融合的短片；可換成新剪輯後覆蓋，或改 `content/stories.json` 的 `media.src`。 |
| `public/media/dad-cover-cinematic.mp4` | 故事「半夜出發，凌晨登礁」 | 粉專封面礁岩融合短片；同上。 |
| `public/media/story-reef-dawn.mp4` | 故事「現在，還在釣」 | 抽象清晨磯場佔位片；之後可換成粉專真實素材融合版。 |
| `public/media/fb/*.jpg` | 粉專公開圖素材庫 | 從粉專下載／匯出的公開圖；給剪輯用。融合進 mp4 後故事區主要播影片，這些 jpg 可留作素材或改成 `type: "image"` 章節。 |

### 粉專融合短片（FB fused clips）

1. 把新的公開圖放到 `public/media/fb/`。
2. 用偏好的剪輯流程做成直式、日本釣魚節目調性短片（實景感、少字卡）。
3. 輸出覆蓋對應的 `dad-*-cinematic.mp4`，或新增檔名並改 `content/stories.json`：

```json
"media": {
  "type": "video",
  "src": "/media/your-new-clip.mp4",
  "alt": "說明文字",
  "credit": "鹿港漁人 Facebook 公開貼文"
}
```

圖片章節則用 `"type": "image"` 與 `/media/fb/….jpg`。改完跑一次 `npm run build` 確認路徑正確。

## 授權與出處（Attribution）

- 故事影片／照片素材來自 **「鹿港漁人」Facebook 粉專已公開貼文／封面**（或由其公開圖融合而成），僅供本紀念落地頁使用。
- 文案為改寫後的公開內容，**不寫**電話、地址、本名、生日，也不擅自放釣友真實全名。
- `ambient.mp3` 為佔位海浪噪音，非正式商用配樂授權檔；上線前請換成有授權的曲目。
- 外連僅 Facebook 粉專；本站不蒐集訪客個資。

## 隱私注意

- 只用粉專／部落格**已公開**內容。
- 不要把私人訊息、未公開相簿、聯絡方式寫進 `content/` 或媒體字幕。
- NFC 只寫正式 HTTPS 網址，不寫個資進標籤。

## NFC 寫入（部署後）

1. **正式 HTTPS 網址（已上線）**：`https://lukang-fisherman.vercel.app`  
   若之後綁自訂網域，以自訂網域為準並更新此段。
2. 用 NFC 寫入工具（如 NFC Tools）將 **NTAG216** 寫成該 URL（URI / URL record）。
3. 實機掃一次：應開瀏覽器進本站，首屏即可按「加入鹿港漁人」。
4. 重寫標籤時一律用本段紀錄的最終 URL。

## 內容檔對照

- `content/site.json` — 標題、CTA 文案、粉專／部落格 URL、頁底署名  
- `content/stories.json` — 電影感章節敘事＋`media.src`
- `content/memories.json` — 粉專紀念貼圖小卡
