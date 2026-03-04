# Phaser Parity Matrix

This document defines the acceptance contract for the Phaser migration.  
Status values: `pending`, `in-progress`, `done`.

## Gameplay Core

| Feature | Source | Phaser Target | Status | Acceptance |
| --- | --- | --- | --- | --- |
| Player movement (WASD/arrows) | `src/hooks/controls/useKeyboardControls.ts` | `src-phaser/core/input/KeyboardInput.ts` | pending | Player moves at configured speed in 8 directions |
| Player direction/facing | `src/utils/player/playerControls.ts` | `src-phaser/core/systems/PlayerSystem.ts` | pending | Facing flips left/right and direction updates for weapons |
| Contact damage cooldown | `src/utils/player/playerControls.ts` | `src-phaser/core/systems/CollisionSystem.ts` | pending | Damage ticks at 500ms intervals while overlapping enemies |
| Enemy chase AI | `src/hooks/entities/useEnemyBehavior.ts` | `src-phaser/core/systems/EnemySystem.ts` | pending | Enemies continuously move toward player |
| Wave spawning by timer | `src/hooks/game/useWaveManager.ts` | `src-phaser/core/systems/WaveSystem.ts` | pending | Spawn intervals and max active limits match config |
| Enemy culling | `src/hooks/game/useWaveManager.ts` | `src-phaser/core/systems/WaveSystem.ts` | pending | Far enemies are removed outside configured cull distance |
| Projectile update/lifecycle | `src/components/BatchedProjectileRenderer.tsx` | `src-phaser/core/systems/ProjectileSystem.ts` | pending | Projectiles move and expire by duration |
| Projectile-enemy collision | `src/components/BatchedProjectileRenderer.tsx` | `src-phaser/core/systems/CollisionSystem.ts` | pending | Enemy takes damage and projectile despawns on hit |
| XP orb attraction/collection | `src/hooks/entities/useXpOrbBehavior.ts` | `src-phaser/core/systems/XpOrbSystem.ts` | pending | Orbs attract in range and grant XP on pickup |

## Weapons and Progression

| Feature | Source | Phaser Target | Status | Acceptance |
| --- | --- | --- | --- | --- |
| Weapon stats per level | `src/store/weaponsStore.ts` | `src-phaser/core/state/PhaserGameState.ts` | pending | Stats resolve from weapon levels and passives |
| Projectile directional weapon | `src/hooks/weapons/useProjectileWeapon.ts` | `src-phaser/core/systems/WeaponSystem.ts` | pending | Fires spread in player direction |
| Nearest-target weapon | `src/hooks/weapons/useNearestProjectileWeapon.ts` | `src-phaser/core/systems/WeaponSystem.ts` | pending | Selects nearest enemy fallback to facing direction |
| Bounce weapon | `src/hooks/weapons/useBounceWeapon.ts` | `src-phaser/core/systems/WeaponSystem.ts` | pending | Projectiles reflect on viewport bounds |
| Orbit weapon | `src/hooks/weapons/useOrbitWeapon.ts` | `src-phaser/core/systems/WeaponSystem.ts` | pending | Orbiters rotate around player and damage enemies |
| Radial weapon | `src/hooks/weapons/useRadialWeapon.ts` | `src-phaser/core/systems/WeaponSystem.ts` | pending | Fires in all directions |
| Arc weapon | `src/components/weapons/ArcWeapon.tsx` | `src-phaser/core/systems/WeaponSystem.ts` | pending | Arc projectiles with gravity-like trajectory |
| XP and level-up pause | `src/store/gameStore.ts` | `src-phaser/core/state/PhaserGameState.ts` | pending | Level-up pauses game and offers 3 upgrade choices |
| Weapon/passive upgrades | `src/store/gameStore.ts` | `src-phaser/core/state/PhaserGameState.ts` | pending | New/upgrade choices are applied correctly |
| Evolution logic | `src/store/gameStore.ts` | `src-phaser/core/state/PhaserGameState.ts` | pending | Weapon evolves when conditions are satisfied |

## UI and Screens

| Feature | Source | Phaser Target | Status | Acceptance |
| --- | --- | --- | --- | --- |
| Main menu | `src/components/screens/MainMenu.tsx` | `src-phaser/scenes/MainMenuScene.ts` | pending | Play, disabled items, version text, resume path |
| Character selection | `src/components/screens/CharacterSelection.tsx` | `src-phaser/scenes/CharacterSelectionScene.ts` | pending | Select unlocked character and back navigation |
| In-game HUD | `src/components/InGameHUD.tsx` | `src-phaser/scenes/HudScene.ts` | pending | Level, XP bar, health, timer, gold, weapon icons |
| Level-up overlay | `src/components/LevelUpOverlay.tsx` | `src-phaser/scenes/HudScene.ts` | pending | Shows upgrade options and resumes on selection |
| Manual pause | `src/App.tsx` | `src-phaser/scenes/HudScene.ts` | pending | Escape pauses/resumes with menu state semantics |
| Game over screen | `src/components/screens/GameOver.tsx` | `src-phaser/scenes/GameOverScene.ts` | pending | Shows run stats and restart/main-menu flow |
| Mobile joystick | `src/components/TouchJoystick.tsx` | `src-phaser/core/input/TouchJoystick.ts` | pending | Drag-based analog input on touch devices |

## Quality Gates

| Gate | Requirement |
| --- | --- |
| TDD | Every subsystem starts with failing tests, then implementation, then refactor |
| E2E gate | Build scripts fail if E2E suite fails |
| Professional standards | Strict TypeScript, lint clean, modular systems, documented decisions |
