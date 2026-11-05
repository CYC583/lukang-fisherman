# 鹿港漁人 opener-montage — cinematic v1

**Output:** `/workspace/lukang-fisherman/public/media/opener-montage.mp4`  
**Backup:** `/workspace/lukang-fisherman/public/media/opener-montage_v_cinematic.mp4`  
**Spec:** 1080×1920 (9:16), 30 fps, H.264 yuv420p CRF 18, AAC, `+faststart`, ~22.0 s  
**Grade:** cool teal-morning (`eq` contrast↑ sat↓ + slight blue/teal `colorbalance`) — NOT cartoon HDR  
**Cuts:** hard cuts only (no dissolve as rhythm)

## Source limitations (honest)

| Need | Reality | What we did |
| --- | --- | --- |
| True dad cast / windup | **Not in source media** | AI gen `gen-cast.mp4` (720×1280) guided by FB rod POV + coast refs |
| Reel / line CU | **Missing** | AI gen `gen-reel.mp4` |
| Rod-bend fight | **Missing** | AI gen `gen-fight.mp4` |
| Fish-out splash | **Missing** (only held-fish stills/clip) | AI gen `gen-splash.mp4` + `setpts≈0.53×` slow-mo |
| Pride catch | **HAVE** `dad-catch-cinematic.mp4` | Used as emotional payoff (REAL dad) |
| Dawn / reef / horizon | **HAVE** reef + cover + cover-loop + hero-cover | Used for open + settle |
| Old opener | 480×854, weak energy | Replaced at 1080×1920 |

AI action faces ≠ exact dad likeness. Pride CU is the authentic dad beat friends will recognize.

## Exact cut list

| # | t (s) | dur | Label | Source | In→Out | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 0.0–0.4 | 0.4 | black + hook SFX | (generated black) | — | short sine+brown noise “hook/drip” |
| 1 | 0.4–2.8 | 2.4 | dawn wide + ≤5% push | `story-reef-dawn.mp4` | 0.60–3.00 | foggy reef establish |
| 2 | 2.8–4.6 | 1.8 | cast | `_build/gen-cast.mp4` | 1.00–2.80 | whoosh SFX @ 2.8 |
| 3 | 4.6–6.4 | 1.8 | reel CU | `_build/gen-reel.mp4` | 0.60–2.40 | craft detail |
| 4 | 6.4–8.6 | 2.2 | fight / rod bend | `_build/gen-fight.mp4` | 1.20–3.40 | tension peak build |
| 5 | 8.6–11.2 | 2.6 | splash slow-mo | `_build/gen-splash.mp4` | 1.00–2.40 @≈0.53× | emotional climax + splash SFX |
| 6 | 11.2–13.6 | 2.4 | pride CU | `dad-catch-cinematic.mp4` | 1.50–3.90 | **REAL dad** scales/eye |
| 7 | 13.6–16.0 | 2.4 | horizon | `dad-cover-cinematic.mp4` | 2.00–4.40 | center-crop 9:16, start darken |
| 8 | 16.0–18.5 | 2.5 | hold / darken ~40% | `cover-loop.mp4` | 0.50–3.00 | brightness↓ toward cover |
| 9 | 18.5–22.0 | 3.5 | settle | `hero-cover.jpg` | still | last 0.7 s fade toward black |

## Audio ride

| Layer | Behavior |
| --- | --- |
| `ambient.mp3` | water bed, ~−11 dB relative, full length |
| `bgm-doc.m4a` | documentary low strings; **vol 1.0 → 13.6 s**; linear → **0.40 by 18.5**; → **~0.33 by 22** |
| hook SFX | t=0, ≤0.25 s |
| whoosh | t=2.8 (cast cut), ≤0.28 s |
| splash | t=8.6 (splash cut), ~0.35 s from ambient peak |
| loudnorm | `I=-15`, `TP=-1.5`, `LRA=11` |

## Frame grabs (review)

`/workspace/lukang-fisherman/docs/opener-frames/`

- `01_dawn.jpg` @ 1.6 s  
- `02_cast.jpg` @ 3.7 s  
- `03_reel.jpg` @ 5.5 s  
- `04_fight.jpg` @ 7.5 s  
- `05_splash.jpg` @ 9.9 s  
- `06_pride.jpg` @ 12.4 s  
- `07_horizon.jpg` @ 14.8 s  
- `09_settle.jpg` @ 20.25 s  

## Cover typography (elderly / 磯釣 line) — for 雜事 UI

On ~390 px wide iPhone paper panel:

| Layer | Min | Prefer | Notes |
| --- | --- | --- | --- |
| Eyebrow (`ISOFISHING · TAIWAN`) | 15–16 px | 16 px | tracking OK, don’t go below 15 |
| Main title (`鹿港漁人`) | 34 px | **36–40 px** | already ~`clamp(2.25rem…)` — keep |
| Subline / 磯釣態度句 (`磯上十年。海不等人。` or any 磯釣…) | **20 px absolute min** | **20–22 px** | line-height **1.45**; color ≥ **4.5:1** on paper-white `#FCFAF5` (use `#1a1a1a` or darker) |
| English subtitle | 16–18 px | 18 px | secondary |
| CTAs | height **52–54 px** | keep | primary solid 霧金, secondary outline |

**Do not** shrink the 磯釣／態度句 under 20 px to “look elegant.” Friends’ parents scan this too.

## Gap vs old live opener / site (距「靠北好屌」)

1. Old opener **480×854** → now **1080×1920**  
2. Old: weak / PPT energy, no clear cast→fight→land arc → now hard-cut documentary beat  
3. Missing real cast/fight/splash filled with AI gens; pride remains real dad  
4. Audio: ambient + doc BGM ride + cut SFX (not silent / not EDM)  
5. Cover UI still 雜事’s job: paper-white 霧金, dual CTA, **no** 漢字輪播 / parallax shake  

## Deploy

**Do not deploy from this agent.** 雜事 copies `public/media/opener-montage.mp4` (+ poster if needed) and ships.
