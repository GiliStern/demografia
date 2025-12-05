Based on the "Project Demographia: A Comprehensive Technical Blueprint for AI-Assisted Development" and the accompanying asset manifest, here are the specific blueprint files required to initialize the AI development process.

You should create these files in your project's root or `src/data` directory (as specified by your architecture) so the AI (e.g., Cursor/GPT-5) can reference them immediately to build the game's core systems.

### 1. File: `generated_placeholders_manifest.txt`

This file acts as the master list for the asset pipeline. The AI will use this to know which placeholder assets it needs to generate or reference in the code,.

```text
bg/achievements.png
bg/char_select.png
bg/settings.png
bg/shop.png
bg/stage_select.png
bg/tel_aviv_loop.png
music/jerusalem_theme.wav
music/tel_aviv_theme.wav
sfx/chest_open.wav
sfx/hit.wav
sfx/levelup.wav
sfx/menu_click.wav
sfx/pickup.wav
sprites/characters_32x32.png
sprites/enemies_32x32.png
sprites/items_32x32.png
sprites/portraits_64x64.png
sprites/stage_previews_256x144.png
sprites/ui_32x32.png
sprites/weapons_32x32.png
```

### 2. File: `animation_maps.json`

This file is required for the React Three Fiber (R3F) rendering pipeline. It maps the spritesheets to specific frame indices for animation loops,.

```json
{
  "שרוליק": {
    "idle": {
      "frames":,
      "duration": 500
    },
    "walk": {
      "frames":,
      "duration": 400
    }
  }
}
```

### 3. File: `characters.json`

This file externalizes character statistics and starting configurations to allow for balance changes without touching the code.

```json
[
  {
    "id": "char_shrulik",
    "name": "שרוליק",
    "description": "Based on the iconic Israeli caricature.",
    "spriteKey": "sprites/characters_32x32.png",
    "startingWeapon": "weapon_sabra",
    "stats": {
      "maxHealth": 100,
      "moveSpeed": 5,
      "armor": 0,
      "luck": 1.0,
      "xpGainBonus": 0,
      "magnetRange": 1.0
    }
  }
]
```

### 4. File: `weapons.json`

This file defines the behavior, cooldowns, and evolution paths for the initial five weapons as outlined in the design pillars,,.

```json
[
  {
    "id": "weapon_sabra",
    "name": "צבר",
    "description": "Fires prickly pear fruits at the nearest enemy.",
    "baseDamage": 5,
    "baseCooldown": 1.5,
    "evolution": "קקטוס קדוש",
    "upgrades": [
      { "level": 2, "description": "+1 projectile" },
      { "level": 3, "description": "+5 base damage" }
    ]
  },
  {
    "id": "weapon_keter_chairs",
    "name": "כסאות כתר",
    "description": "Bounces white plastic chairs around the screen.",
    "baseDamage": 10,
    "baseCooldown": 2.0,
    "evolution": "אין עתיד",
    "upgrades": []
  },
  {
    "id": "weapon_kaparot",
    "name": "כפרות",
    "description": "Chickens circle the player.",
    "baseDamage": 8,
    "baseCooldown": null,
    "evolution": "סליחות לא קדושות",
    "upgrades": []
  },
  {
    "id": "weapon_pitas",
    "name": "פיתות",
    "description": "Arcs of pita bread are lobbed upwards.",
    "baseDamage": 15,
    "baseCooldown": 2.5,
    "evolution": "בורקס המוות",
    "upgrades": []
  },
  {
    "id": "weapon_star_of_david",
    "name": "מגן דוד",
    "description": "Fires a sharp Star of David in the facing direction.",
    "baseDamage": 7,
    "baseCooldown": 1.0,
    "evolution": "אלף חיתוכים",
    "upgrades": []
  }
]
```

### 5. File: `enemies.json`

This file defines the stats for the enemies required for the initial "Tel Aviv" stage implementation,.

```json
[
  {
    "id": "enemy_street_cats",
    "name": "חתולי רחוב",
    "spriteKey": "sprites/enemies_32x32.png",
    "stats": {
      "health": 10,
      "moveSpeed": 3,
      "damage": 5,
      "xpValue": 1
    }
  },
  {
    "id": "enemy_arsim",
    "name": "ערסים",
    "spriteKey": "sprites/enemies_32x32.png",
    "stats": {
      "health": 20,
      "moveSpeed": 2.5,
      "damage": 10,
      "xpValue": 3
    }
  }
]
```

### 6. File: `waves.json`

This file drives the `WaveManager` system, defining exactly when and how many enemies spawn based on the run timer.

```json
[
  { "time": "00:00", "enemy": "enemy_street_cats", "count": 10 },
  { "time": "00:15", "enemy": "enemy_arsim", "count": 5 },
  { "time": "00:30", "enemy": "enemy_street_cats", "count": 20 }
]
```

### 7. File: `ui.json`

This file ensures all user-facing text is externalized to facilitate the Hebrew localization and allow for easy text updates.

```json
{
  "main_menu": {
    "play_button": "שחק",
    "meta_shop_button": "חנות שדרוגים",
    "achievements_button": "הישגים"
  },
  "character_select": {
    "title": "בחר דמות",
    "confirm_button": "בחר דמות"
  },
  "in_game_hud": {
    "level_label": "מספר רמה",
    "gold_label": "מטבעות זהב"
  }
}
```
