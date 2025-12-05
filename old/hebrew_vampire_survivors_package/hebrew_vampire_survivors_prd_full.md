# Hebrew Vampire Survivors-Style Game — Product Requirements Document (PRD)

## Overview

**Genre:** 2D top-down auto-attacking survival roguelike shooter  
**Platform:** Browser (HTML5/JS) — scalable to desktop/mobile  
**Theme:** Comedic satire of Israeli society — Tel Aviv & Jerusalem settings  
**Core Loop:**  
1. Player chooses a character with unique passive and starting weapon.  
2. Selects stage.  
3. Survives endless enemy waves for as long as possible.  
4. Levels up via XP pickups (**נקודות**).  
5. Chooses weapons/passives, upgrades, evolves via combos.  
6. Defeats minibosses/bosses, collects **פיצויים** (treasure chests).  
7. At 30 minutes, **מלאך המוות** spawns to end run.  

**Design Goal:** Fully replicate Vampire Survivors’ mechanics in a Hebrew comedic setting with all assets & labels **externalized for easy editing**.  
**Delivery Goal:** This PRD is complete enough for an AI or developer to build a fully functional game in one pass, including placeholder art.

---

## Main Screens & Navigation Flow

### 1. Splash Screen
- **Elements:**
  - Game title (Hebrew font, pixel style).
  - Background loop: Tel Aviv street pixel art with light animations (pigeons, streetlights flickering).
  - “לחץ להתחיל” (Press to Start) blinking text.
- **Functionality:**
  - On click/tap → Main Menu.

### 2. Main Menu
- **Layout:**
  - Buttons stacked vertically:
    - “שחק” (Play)
    - “הגדרות” (Settings)
    - “חנות שדרוגים” (Meta-Shop)
    - “הישגים” (Achievements)
    - “צא” (Exit) — only for desktop build.
  - Top-right: Coin counter (**מטבעות זהב**).
  - Top-left: Version number (from JSON meta.version).
- **Functionality:**
  - All buttons navigate to their respective screens.

### 3. Character Selection Screen
- **Layout:**
  - Grid of available characters (initially 1: **שרוליק**, others locked with padlock icons).
  - Each card shows:
    - Pixel portrait (8-bit style).
    - Name in Hebrew.
    - Passive ability description.
    - Starting weapon icon.
    - Unlock requirement (if locked).
  - “בחר דמות” (Select Character) button.
  - “חזור” (Back) button.
- **Functionality:**
  - Clicking a character highlights it.
  - Confirm → Stage Selection.

### 4. Stage Selection Screen
- **Layout:**
  - Horizontal carousel of available stages (initially 2: **רחובות תל אביב**, **ירושלים העתיקה**).
  - Stage card shows:
    - Pixel preview background.
    - Name in Hebrew.
    - Short description.
    - Icons for known hazards (if any).
  - “בחר שלב” (Select Stage) button.
  - “חזור” (Back) button.
- **Functionality:**
  - Select stage → Game starts with chosen character/stage.

### 5. Meta-Shop Screen
- **Layout:**
  - List of power-ups with:
    - Icon.
    - Name in Hebrew.
    - Cost in **מטבעות זהב**.
    - Current level / max level.
  - “קנה” (Buy) buttons.
  - Coin counter at top-right.
  - “חזור” (Back) button.
- **Functionality:**
  - Clicking “קנה” deducts coins, increases stat in persistent save.

### 6. Settings Screen
- **Layout:**
  - Toggles/sliders for:
    - Volume (music/SFX).
    - Language (Hebrew default).
    - Fullscreen toggle.
    - Pixel scaling factor.
  - “חזור” button.

### 7. Achievements Screen
- **Layout:**
  - Scroll list of achievements with:
    - Icon.
    - Name.
    - Description.
    - Completion checkmark.
- **Functionality:**
  - Achievements tied to unlocks (characters, arcanas, stages).

---

## In-Game UI

**Top HUD:**
- Timer (mm:ss).
- XP bar at bottom of screen.
- Level indicator (מספר רמה).
- Gold counter (**מטבעות זהב**).
- Active weapon icons with level numbers.
- Passive item icons.

**Popup Menus:**
- **Level-Up Menu:**
  - Shows up to 4 cards for random weapons/passives.
  - Click to select upgrade.
- **Pause Menu:**
  - “המשך” (Resume)
  - “התחל מחדש” (Restart)
  - “חזור לתפריט” (Main Menu)

**Chest Opening Screen:**
- Animated pixel chest opening.
- Items pop out with sound.
- Text: “פיצויים!”

---

## Gameplay Systems

### Characters
- Initial: **שרוליק**
- Starting weapon: **צבר**
- Passive: Configurable in JSON.

### Weapons & Evolutions
- 5 starting weapons, evolutions as per JSON mapping.
- Mechanics: auto-fire, upgrades, evolutions.

### Passives, Pickups, Arcanas, Power-Ups
- Fully mapped in `game_assets_hebrew_template_safe.json`.

### Enemies & Stages
**Tel Aviv:**
- Common: חתולי רחוב, היפסטר, תייר, נחיל קורקינטים, טיקטוקיסט
- Minibosses: סערת רחוב צבעונית, עבודות הרכבת הקלה, מחאת קפלן
- Boss: איראן

**Jerusalem:**
- Common: עולי רגל, שומרי סדר, רוחות בירוקרטיה
- Minibosses: צלבנים חמושים, לגיונרים רומאים, מפקד ממלוכי
- Bosses: נבוכדנצר, טיטוס

---

## Progression & Meta-Shop
- Permanent upgrades purchasable with coins.
- Identical effects to Vampire Survivors.

---

## Modes & Endgame
- Default 30-min run → מלאך המוות spawn.
- Endless, Hurry, Hyper modes toggleable after relic unlock.

---

## Art & Audio
- **Pixel retro**, 8-bit style for characters/enemies.
- All assets stored in spritesheets, 32×32px base.
- Placeholders must be generated for all:
  - Characters.
  - Weapons.
  - Enemies (each stage).
  - UI elements.
- Background music: chiptune with Israeli motifs.
- SFX for attacks, hits, pickups, menus.

---

## Technical Requirements
- Engine: PhaserJS or Godot HTML5 export.
- All strings, stats, sprite paths externalized in JSON.
- Save data stored in browser localStorage.
- Modular system for adding/replacing assets.

---

## Reference
All asset definitions in:  
`game_assets_hebrew_template_safe.json`

Contains:  
- Characters  
- Weapons & evolutions  
- Passives  
- Pickups  
- Arcanas  
- Power-ups  
- Stages & enemies  
- Relics  
- Modes  

---
