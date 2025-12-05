# Hebrew Vampire Survivors-Style Game — Product Requirements Document (PRD) — v2

> This PRD is paired with a comprehensive JSON: `game_assets_hebrew_template_v0_2.json`  
> It includes **all strings, gameplay assets, UI labels, and layout metadata**. Change the JSON only to reskin or localize the game.

## Overview
(unchanged; see previous PRD for detailed loop and theme)

## Main Screens & Navigation Flow
(identical to previous section), with the following **implementation notes**:
- **Strings** come from `ui_strings` in the JSON.
- **Layout** and element positions/sizes come from `ui_layout.screens` (relative coordinates for scaling).
- **Navigation** actions are defined per-screen (e.g., `goto:*`, `start_game`).

## In-Game UI
- HUD labels, counters, and icons are defined in `ui_strings.hud` and bound via `bind_value` keys.
- The chest opening title is `ui_strings.chest.title`.

## Gameplay Assets
- Characters, weapons, passives, pickups, arcanas, meta-shop, stages, relics, modes — all in JSON.
- Spritesheets, atlases, and placeholder frame counts in `assets` section.

## Saving & Settings
- Browser `localStorage` keys declared at `gameplay.save.keys`.

## Art & Audio
- Spritesheet paths and frame sizes in `assets.spritesheets` and `assets.placeholders`.
- Use generated placeholder sprites (8-bit) at build-time if actual art missing.

## Build Notes (Cursor/GPT-5)
- Parse `ui_layout` to render screens dynamically.
- Bind counters to `player.gold`, `meta.version` etc.
- Use `coordinate_mode: relative` to support all resolutions.
- Respect `i18n.rtl_ui=true` and `meters_ltr=true`.

## Reference
- Primary JSON: `game_assets_hebrew_template_v0_2.json`
- Previous JSON (safe): `game_assets_hebrew_template_safe.json` (legacy)
