---
name: Demographia Project Setup
overview: Create a detailed implementation plan to build Demographia, a Vampire Survivors-like game using React Three Fiber, migrating assets from the old HTML5 Canvas implementation and following the data-driven architecture specified in the technical blueprint.
todos:
  - id: setup-project
    content: Initialize Vite + React + TypeScript project with proper configuration
    status: pending
  - id: install-dependencies
    content: "Install core dependencies: @react-three/fiber, @react-three/drei, @react-three/rapier, zustand, three"
    status: pending
    dependencies:
      - setup-project
  - id: migrate-assets
    content: Copy reusable assets from old/hebrew_vampire_survivors_package/ to public/assets/
    status: pending
    dependencies:
      - setup-project
  - id: create-json-configs
    content: Create all JSON configuration files in src/data/ (characters, weapons, enemies, waves, ui, animation_maps)
    status: pending
    dependencies:
      - setup-project
  - id: setup-r3f-scene
    content: Create basic R3F Canvas with orthographic camera and ground plane
    status: pending
    dependencies:
      - install-dependencies
  - id: setup-zustand-store
    content: Create Zustand store with player state, game state, and data loading
    status: pending
    dependencies:
      - install-dependencies
  - id: implement-player
    content: Create Player component with Rapier physics, movement controls, and sprite rendering
    status: pending
    dependencies:
      - setup-r3f-scene
      - setup-zustand-store
      - create-json-configs
  - id: implement-weapon-system
    content: Create Projectile component and implement מגן דוד weapon with cooldown and firing logic
    status: pending
    dependencies:
      - implement-player
  - id: implement-enemy-system
    content: Create Enemy component with AI movement and WaveManager for spawning
    status: pending
    dependencies:
      - implement-player
  - id: implement-collisions
    content: Add Rapier collision detection for projectile-enemy and enemy-player interactions
    status: pending
    dependencies:
      - implement-weapon-system
      - implement-enemy-system
  - id: implement-hud
    content: Create InGameHUD component with timer, level, gold, and weapon/item displays
    status: pending
    dependencies:
      - setup-zustand-store
      - create-json-configs
  - id: implement-main-menu
    content: Create MainMenu screen component with navigation and Hebrew text from ui.json
    status: pending
    dependencies:
      - setup-zustand-store
      - create-json-configs
  - id: implement-game-loop
    content: Add game over logic, screen transitions, and basic game flow
    status: pending
    dependencies:
      - implement-hud
      - implement-main-menu
      - implement-collisions
---

# Demographia Project Implementation Plan

## Overview

This plan outlines the complete setup and initial implementation of Demographia, a satirical Israeli-themed survival game built with React Three Fiber. The project will migrate reusable assets from the old HTML5 Canvas implementation (`old/`) and follow the data-driven architecture specified in `plans/ai-bried-plan.md`.

## Phase 1: Project Scaffolding and Core Systems

### 1.1 Initialize React + TypeScript Project

- Create new Vite project with React + TypeScript template
- Set up project structure following R3F best practices
- Configure TypeScript with strict settings (reference `old/tsconfig.json`)
- Set up ESLint and Prettier (reuse configs from `old/`)

### 1.2 Install Core Dependencies

Install the technology stack as specified:

- `three` - Core 3D library
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - R3F helpers and utilities
- `@react-three/rapier` - Physics engine wrapper
- `zustand` - State management
- `gsap` or `framer-motion` - UI animations (optional for Phase 1)

### 1.3 Asset Migration

- Copy reusable assets from `old/hebrew_vampire_survivors_package/` to `public/assets/`:
  - Background images (`bg/`)
  - Sprites (`sprites/`)
  - Audio files (`music/`, `sfx/`)
- Create `public/assets/generated_placeholders_manifest.txt` listing all assets
- Extract and adapt sprite references from `old/hebrew_vampire_survivors_package/game_assets_hebrew_template_v0_2.json`

### 1.4 Basic R3F Scene Setup

- Create `src/components/GameCanvas.tsx` with R3F `<Canvas>`
- Set up orthographic camera for top-down 2D view
- Create basic ground plane
- Configure lighting suitable for 2D sprite rendering
- Test scene renders correctly

### 1.5 State Management Foundation

- Create `src/store/gameStore.ts` using Zustand
- Define initial store structure:
  - Player state (health, maxHealth, position, stats)
  - Game state (runTimer, isPaused, currentLevel)
  - Enemy list
  - Weapon list
  - Game data (loaded JSON configs)
- Create store slices for modularity

## Phase 2: Data-Driven Configuration System

### 2.1 Create JSON Configuration Files

Create all data files in `src/data/` as specified in the blueprint:

- `characters.json` - Character definitions (start with שרוליק)
- `weapons.json` - Weapon configurations (all 5 initial weapons)
- `enemies.json` - Enemy stats (חתולי רחוב, ערסים)
- `waves.json` - Wave spawn timeline
- `ui.json` - UI text strings (Hebrew)
- `animation_maps.json` - Sprite animation frame mappings

### 2.2 Data Loader System

- Create `src/utils/dataLoader.ts` to load and parse JSON files
- Create `src/hooks/useGameData.ts` to load data on app start
- Integrate data loading into Zustand store
- Add error handling for missing/invalid data files

### 2.3 Asset Loading System

- Create `src/utils/assetLoader.ts` for texture loading
- Use Three.js TextureLoader for spritesheets
- Create sprite texture cache to avoid redundant loads
- Implement spritesheet frame extraction utility

## Phase 3: Player Implementation

### 3.1 Player Component

- Create `src/components/Player.tsx` React component
- Integrate Rapier RigidBody for physics
- Render player as textured plane using sprite from `sprites/characters_32x32.png`
- Position camera to follow player (using drei's `<OrbitControls>` or custom camera controller)

### 3.2 Player Movement

- Create `src/hooks/useKeyboardControls.ts` for WASD/Arrow key input
- Implement movement logic in `useFrame` hook:
  - Read input state
  - Calculate velocity vector
  - Apply velocity to Rapier RigidBody
- Store player position in Zustand store

### 3.3 Player Sprite Animation

- Implement sprite animation system using `animation_maps.json`
- Create `src/components/Sprite.tsx` reusable component for animated sprites
- Animate player idle/walk states based on movement
- Handle sprite frame timing and looping

### 3.4 Player Stats Integration

- Connect player component to Zustand store
- Display health bar (placeholder UI)
- Implement damage system (enemy collision will be added in Phase 4)

## Phase 4: Single Weapon System (Proof of Concept)

### 4.1 Projectile Component

- Create `src/components/Projectile.tsx` reusable component
- Use Rapier RigidBody for physics
- Render as textured plane with weapon sprite
- Implement lifetime/despawn logic

### 4.2 Weapon Component (מגן דוד)

- Create `src/components/weapons/StarOfDavidWeapon.tsx`
- Load weapon config from `weapons.json`
- Implement cooldown timer using `useFrame`
- Spawn projectiles in player's facing direction
- Calculate facing direction from last movement vector

### 4.3 Weapon-Player Integration

- Add weapon to player's active weapons list in store
- Render weapon component as child of Player component
- Test weapon fires correctly and projectiles move

## Phase 5: Single Enemy System

### 5.1 Enemy Component

- Create `src/components/Enemy.tsx` reusable component
- Load enemy config from `enemies.json`
- Integrate Rapier RigidBody
- Render enemy sprite from `sprites/enemies_32x32.png`
- Implement simple "move towards player" AI in `useFrame`

### 5.2 Wave Manager

- Create `src/components/WaveManager.tsx`
- Load `waves.json` configuration
- Monitor run timer from Zustand store
- Spawn enemies at specified times:
  - Calculate spawn positions outside viewport
  - Instantiate Enemy components
  - Add to enemy list in store

### 5.3 Collision System

- Implement Rapier collision events:
  - Projectile-Enemy collision: Destroy enemy, remove projectile
  - Enemy-Player collision: Deal damage to player
- Update health in Zustand store
- Add visual feedback (screen shake, damage flash)

### 5.4 XP and Gold Drops

- Create `src/components/XPGem.tsx` and `src/components/GoldCoin.tsx`
- Spawn on enemy death
- Implement magnet effect (player attracts XP gems within range)
- Collect and update player stats in store

## Phase 6: Basic UI and Game Loop

### 6.1 In-Game HUD

- Create `src/components/InGameHUD.tsx`
- Layout as specified:
  - Top center: Run timer (mm:ss format)
  - Top left: Level and XP bar
  - Top right: Gold count
  - Left side: Weapon icons list
  - Right side: Passive items list
- Load all text labels from `ui.json`
- Connect to Zustand store for real-time updates

### 6.2 Main Menu Screen

- Create `src/components/screens/MainMenu.tsx`
- Use background from `bg/tel_aviv_loop.png`
- Implement navigation buttons:
  - שחק (Play) - transitions to character select
  - חנות שדרוגים (Meta-Shop) - placeholder
  - הישגים (Achievements) - placeholder
- Load button text from `ui.json`

### 6.3 Screen Management

- Create `src/store/screenStore.ts` for screen state
- Implement screen transitions
- Create screen router component

### 6.4 Game Over Logic

- Detect when player health reaches 0
- Transition to Game Over screen
- Display run statistics
- Return to main menu option

## Phase 7: Polish and Testing

### 7.1 Audio Integration

- Create `src/utils/audioManager.ts` for sound effects
- Load audio files from `public/assets/sfx/` and `music/`
- Implement music playback for stages
- Add sound effects for:
  - Weapon firing
  - Enemy hits
  - Pickup collection
  - Level up

### 7.2 Performance Optimization

- Implement geometry instancing for projectiles (if needed)
- Optimize sprite rendering
- Add entity pooling for frequently spawned objects
- Profile and optimize render loop

### 7.3 Testing and Debugging

- Create debug overlay (F3 key toggle)
- Display FPS, entity counts, player stats
- Add console commands for testing
- Test 30-minute run stability

## File Structure

```
demografia/
├── public/
│   └── assets/
│       ├── bg/
│       ├── sprites/
│       ├── music/
│       ├── sfx/
│       └── generated_placeholders_manifest.txt
├── src/
│   ├── components/
│   │   ├── GameCanvas.tsx
│   │   ├── Player.tsx
│   │   ├── Enemy.tsx
│   │   ├── Projectile.tsx
│   │   ├── Sprite.tsx
│   │   ├── WaveManager.tsx
│   │   ├── InGameHUD.tsx
│   │   ├── weapons/
│   │   │   └── StarOfDavidWeapon.tsx
│   │   └── screens/
│   │       ├── MainMenu.tsx
│   │       └── GameOver.tsx
│   ├── data/
│   │   ├── characters.json
│   │   ├── weapons.json
│   │   ├── enemies.json
│   │   ├── waves.json
│   │   ├── ui.json
│   │   └── animation_maps.json
│   ├── store/
│   │   ├── gameStore.ts
│   │   └── screenStore.ts
│   ├── hooks/
│   │   ├── useGameData.ts
│   │   └── useKeyboardControls.ts
│   ├── utils/
│   │   ├── dataLoader.ts
│   │   ├── assetLoader.ts
│   │   └── audioManager.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Key Implementation Notes

1. **Asset Reuse**: The old implementation has valuable assets in `old/hebrew_vampire_survivors_package/`. These should be copied to `public/assets/` and referenced in the new R3F implementation.

2. **Data Migration**: Extract relevant data from `old/hebrew_vampire_survivors_package/game_assets_hebrew_template_v0_2.json` and adapt to the new JSON structure specified in the blueprint.

3. **Hebrew Text**: All UI text must be loaded from `ui.json` to maintain the data-driven approach. The old JSON file has comprehensive Hebrew strings that can be adapted.

4. **Physics**: Use Rapier for all collision detection. The 2D top-down view will use a 3D physics world with locked Z-axis.

5. **Performance**: Start simple, optimize later. R3F handles many optimizations automatically, but entity pooling may be needed for hundreds of projectiles/enemies.

6. **Testing Strategy**: Test each phase independently before moving to the next. Create simple test scenes to verify functionality.