# Hebrew Vampire Survivors-Style Game — Product Requirements Document (PRD)

## Overview

**Genre:** 2D top-down auto-attacking survival roguelike shooter  
**Platform:** Browser (HTML5/JS) — scalable to desktop/mobile  
**Theme:** Comedic satire of Israeli society — Tel Aviv & Jerusalem settings  
**Core Loop:**  
1. Player chooses a character with unique passive and starting weapon.  
2. Survive endless enemy waves for as long as possible.  
3. Level up by collecting XP pickups (**נקודות**).  
4. Choose weapons/passives, upgrade them, and evolve them via combos.  
5. Fight stage minibosses/bosses, collect **פיצויים** (treasure chests).  
6. At 30 minutes, **מלאך המוות** spawns to end the run.  

**Design Goal:** Fully replicate Vampire Survivors’ mechanics in Hebrew setting with all assets & labels **externalized for easy editing**.

---

## Data & Config Structure

All **names, labels, descriptions, and art references** are stored in editable config files.  
Primary asset pack: [game_assets_hebrew_template_safe.json](game_assets_hebrew_template_safe.json)

- Externalized text enables quick localization or reskin without touching gameplay code.
- Config includes weapons, passives, pickups, arcanas, meta-shop, enemies, stages, relics, and modes.

---

## Gameplay Systems

### Characters
- Initial: **שרוליק** (starting weapon: **צבר**, iconic Israeli caricature)
- Future characters unlocked via achievements/meta-shop.

### Weapons & Evolutions
Replicates Vampire Survivors’ base mechanics:  
- Auto-fire  
- Upgrade over levels  
- Evolutions require maxed base weapon + paired passive + chest drop

### Passives, Pickups, Arcanas, Power-Ups
- All translated to Hebrew comedic equivalents.
- Effects identical to Vampire Survivors for launch version.

### Enemies & Stages
#### Tel Aviv
- Common: חתולי רחוב, היפסטר, תייר, נחיל קורקינטים, טיקטוקיסט  
- Minibosses: סערת רחוב צבעונית, עבודות הרכבת הקלה, מחאת קפלן  
- Boss: איראן

#### Old Jerusalem
- Common: עולי רגל, שומרי סדר, רוחות בירוקרטיה  
- Minibosses: צלבנים חמושים, לגיונרים רומאים, מפקד ממלוכי  
- Bosses: נבוכדנצר, טיטוס

---

## Progression & Meta-Shop
- Permanent power-ups purchasable with **מטבעות זהב**.
- Identical effects to Vampire Survivors’ meta-shop upgrades.

---

## Modes & Endgame
- 30-min cap by default, **מלאך המוות** spawn
- Endless, Hurry, and Hyper modes available via relics.

---

## Art & Audio
- **Pixel retro** (32×32 tiles/characters), comedic palette.
- Ambient props and sounds match Tel Aviv/Jerusalem satire themes.
- Chiptune OST with local motifs, voice lines in Hebrew for bosses.

---

## Technical Requirements
- Engine: PhaserJS or Godot with HTML5 export.
- Right-to-left UI text, LTR numbers/meters.
- All stats, sprites, sounds loaded from JSON.

---

## Reference
Primary config file:  
[game_assets_hebrew_template_safe.json](game_assets_hebrew_template_safe.json)

This JSON contains **all assets, names, stats, and references** required to build the game in full.
