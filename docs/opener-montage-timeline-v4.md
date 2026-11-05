# 鹿港漁人 opener v4 — 時間軸（字幕＋去重複＋多動作／畫質↑）

- 輸出：`public/media/opener-montage.mp4`（＝備份 `public/media/opener-montage_v4.mp4`，byte-identical）
- v3 備份保留：`public/media/opener-montage_v3_vo.mp4`（未覆寫）
- 規格：1080×1920，30fps，H.264 High **CRF16／maxrate 12M**，AAC 192k 48kHz 立體聲，faststart，**29.30s**，約 **44.7MB**，視訊約 **12.0 Mbps**
- VO：沿用 v3 `zh-TW-YunJheNeural`（`_build/vo_v3/l1–l9.wav`）＋ duck ambient/BGM＋SFX
- **Burn-in 字幕**：ASS 整句淡入淡出（禁卡拉OK）；字體 Noto Sans CJK TC Bold；霧金主色＋深墨描邊；對準 VO 句
- 調色：對比 +10%、飽和 −12%、暗冷亮暖、暗角、細顆粒（alls=4，較 v3 更少雜訊）
- 建置：`public/media/_build/v4/build_v4.py`；字幕 `subs.ass`；meta `build_meta.json`

## 裝備文字／認人規則（YC 硬要求）
- **認人鏡唯一真靜圖**：`fb/refs/ref_gear_full.jpg`＝post_older_4：白帽金盾徽＋月桂、背心左胸金色 **SUNLINE**、右袖紅字 **LIMITED PRO**、左袖 **SHIMANO**、青綠花紋面罩
- AI 動作鏡採背／側／中遠景；竿線特寫 `v4-gear-cu` **無人無 logo**，避免 AI 改字
- 收尾改 AI pride（蒙面持魚），**不再重複**同一張真靜圖

## VO 句 ↔ 字幕時間

| # | 旁白 | VO 入 | VO 出／字幕出 |
|---|---|---|---|
| 1 | 這位，就是鹿港漁人。 | 0.70 | 2.85 |
| 2 | 磯上十幾年，潮汐不等人，他也不等人。 | 3.40 | 7.00 |
| 3 | 竿一揚，線切風； | 7.05 | 9.00 |
| 4 | 從鹿港殺到卵石堤，殺到西岸磯場—— | 9.15 | 12.40 |
| 5 | 迴流一送，黑鯛撞在腳邊； | 12.75 | 15.30 |
| 6 | 銀鱗帶水出水，線還咬在嘴上。 | 16.20 | 19.10 |
| 7 | 他不是來打卡的。 | 19.80 | 21.20 |
| 8 | 他是來把海逼出答案的。 | 21.60 | 23.60 |
| 9 | 鹿港漁人。 | 24.55 | 26.40 |

## 鏡頭表

| # | 時間軸 | 長度 | 素材 | 入→出 | 來源 | 內容 | VO |
|---|---|---|---|---|---|---|---|
| 00 open_wave | 0.00–0.50 | 0.50s | `dad-cover-cinematic.mp4` | 4.2→4.7 | 真實 | 黑場→浪打磯 | — |
| 01 id_him | 0.50–3.20 | 2.70s | `fb/refs/ref_gear_full.jpg` | 靜態慢推 | 真實 | 認人：粉專真照（白帽金徽／SUNLINE／LIMITED PRO／SHIMANO／青綠面罩）唯一使用此靜圖 | 1 |
| 02 iso_sea | 3.20–4.90 | 1.70s | `dad-cover-cinematic.mp4` | 0.5→2.2 | 真實 | 磯＋海真海岸片（不同入點） | 2 |
| 03 him_stand | 4.90–6.80 | 1.90s | `_build/v4/v4-iso-stand.mp4` | 0.5→2.4 | AI | 磯上站姿背影＋浪爆（AI，中遠景避近拍改字） | 2 |
| 04 cast | 6.80–9.00 | 2.20s | `_build/v4/v4-cast.mp4` | 1.0→3.4 | AI | 拋竿動作（AI 背／側） | 3 |
| 05 geo_lukang | 9.00–10.40 | 1.40s | `story-reef-dawn.mp4` | 1.2→3.4 | 真實 | 鹿港／磯 dawn 真片（取代重複 Ken Burns 靜圖） | 4 |
| 06 geo_pebble | 10.40–11.60 | 1.20s | `_build/v3/g-eddy.mp4` | 0.15→1.35 | AI | 卵石堤：真照 i2v（本片只此一段） | 4 |
| 07 geo_west | 11.60–12.80 | 1.20s | `dad-cover-cinematic.mp4` | 5.0→6.2 | 真實 | 西岸磯場浪爆（真片，與 open/iso 不同段） | 4 |
| 08 reel | 12.80–14.40 | 1.60s | `_build/v4/v4-reel.mp4` | 1.0→2.8 | AI | 收線／竿彎（AI） | 5 |
| 09 fight | 14.40–16.20 | 1.80s | `_build/v4/v4-fight-feet.mp4` | 1.2→3.2 | AI | 黑鯛腳邊搏（AI） | 5 |
| 10 splash | 16.20–17.40 | 1.20s | `_build/gen-splash.mp4` | 1.0→1.85 | AI | 銀鱗出水升格（只有魚） | 6 |
| 11 silver_real | 17.40–19.80 | 2.40s | `dad-catch-cinematic.mp4` | 0.4→2.8 | 真實 | 真 dad-catch 銀鱗＋線 | 6 |
| 12 gear_cu | 19.80–21.50 | 1.70s | `_build/v4/v4-gear-cu.mp4` | 0.4→2.2 | AI | 竿／線／捲線器特寫（無人無 logo，避 AI 改字） | 7 |
| 13 force | 21.50–24.40 | 2.90s | `_build/v3/g-sea.mp4` | 1.0→4.2 | AI | 對海立磯逼出答案（AI 背影，本片只此一段） | 8 |
| 14 title_pride | 24.40–27.10 | 2.70s | `_build/v4/v4-pride.mp4` | 0.8→3.5 | AI | 鹿港漁人：AI pride（蒙面持魚；收尾不用重複真靜圖） | 9 |
| 15 handoff_sea | 27.10–29.30 | 2.20s | `cover-loop.mp4` | 0.4→2.6 | 真實 | 封面同款海壓暗交棒 | — |

## Real vs AI 清單

### 真實
- **open_wave**（0.00–0.50）：`dad-cover-cinematic.mp4` — 黑場→浪打磯
- **id_him**（0.50–3.20）：`fb/refs/ref_gear_full.jpg` — 認人：粉專真照（白帽金徽／SUNLINE／LIMITED PRO／SHIMANO／青綠面罩）唯一使用此靜圖
- **iso_sea**（3.20–4.90）：`dad-cover-cinematic.mp4` — 磯＋海真海岸片（不同入點）
- **geo_lukang**（9.00–10.40）：`story-reef-dawn.mp4` — 鹿港／磯 dawn 真片（取代重複 Ken Burns 靜圖）
- **geo_west**（11.60–12.80）：`dad-cover-cinematic.mp4` — 西岸磯場浪爆（真片，與 open/iso 不同段）
- **silver_real**（17.40–19.80）：`dad-catch-cinematic.mp4` — 真 dad-catch 銀鱗＋線
- **handoff_sea**（27.10–29.30）：`cover-loop.mp4` — 封面同款海壓暗交棒

### AI
- **him_stand**（4.90–6.80）：`_build/v4/v4-iso-stand.mp4` — 磯上站姿背影＋浪爆（AI，中遠景避近拍改字）
- **cast**（6.80–9.00）：`_build/v4/v4-cast.mp4` — 拋竿動作（AI 背／側）
- **geo_pebble**（10.40–11.60）：`_build/v3/g-eddy.mp4` — 卵石堤：真照 i2v（本片只此一段）
- **reel**（12.80–14.40）：`_build/v4/v4-reel.mp4` — 收線／竿彎（AI）
- **fight**（14.40–16.20）：`_build/v4/v4-fight-feet.mp4` — 黑鯛腳邊搏（AI）
- **splash**（16.20–17.40）：`_build/gen-splash.mp4` — 銀鱗出水升格（只有魚）
- **gear_cu**（19.80–21.50）：`_build/v4/v4-gear-cu.mp4` — 竿／線／捲線器特寫（無人無 logo，避 AI 改字）
- **force**（21.50–24.40）：`_build/v3/g-sea.mp4` — 對海立磯逼出答案（AI 背影，本片只此一段）
- **title_pride**（24.40–27.10）：`_build/v4/v4-pride.mp4` — 鹿港漁人：AI pride（蒙面持魚；收尾不用重複真靜圖）

## 相對 v3 的去重複／動作
- `ref_gear_full`：**只認人鏡一次**（v3 認人＋收尾重複 → 收尾改 `v4-pride`）
- `g-sea`／`g-eddy`：各只用一段（v3 多段重複）
- 新動作：`v4-cast`／`v4-reel`／`v4-fight-feet`／`v4-iso-stand`／`v4-gear-cu`／`v4-pride`
- Ken Burns 靜圖：僅認人一鏡；地理改 `story-reef-dawn`＋`g-eddy` 動態
- `dad-cover-cinematic` 仍用三段**不同入出點**（開場浪／磯海／西岸浪爆）；內容不同，若 YC 仍覺重複可再換

## SFX
| 時間 | 音效 | 增益 |
|---|---|---|
| 0.50 | boom | -18 dB |
| 7.75 | whoosh | -16 dB |
| 9.00 | boom | -26 dB |
| 14.15 | hook | -12 dB |
| 16.20 | splash | -22 dB |
| 21.50 | boom | -24 dB |
| 24.55 | boom | -17 dB |

## 畫面截圖
`docs/opener-frames-v4/`：每鏡中點、`_t00.60s.jpg`、`_t28.90s.jpg`、`_id_check.jpg`、`_title_check.jpg`、`_sub_check_*.jpg`、`_contact_sheet.jpg`

## 未部署
未 git push、未 Vercel deploy（交雜事）。
