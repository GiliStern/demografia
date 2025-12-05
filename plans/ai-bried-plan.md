Project Demographia: A Comprehensive Technical Blueprint for AI-Assisted Development

1.0 Executive Briefing for Human Orchestrator

This document presents a complete, AI-actionable development plan for the construction of "Demographia," a Vampire Survivors-like game. It synthesizes the satirical creative vision outlined in the game design documents with a robust technical architecture, specifically tailored for the React Three Fiber (R3F) ecosystem. While an initial directive mentioned PhaserJS, the provided expert analysis strongly advocates for an R3F-native stack—comprising React, TypeScript, Three.js, and Rapier—to de-risk development, ensure performance, and align with modern web development practices. This blueprint follows that expert recommendation, providing a clear and efficient path from concept to a playable browser game.

1.1 Orchestrating AI Development (Cursor.ai)

For a human developer orchestrating an AI assistant like Cursor.ai, the following high-level approach is recommended to ensure a smooth and predictable development process:

- Initial Prompting: Begin by providing this entire document as the primary context for the AI. This establishes the complete architectural and design vision, minimizing ambiguity and ensuring all generated code adheres to the project's foundational principles.
- Phased Implementation: Command the AI to build the game in the logical phases outlined in Section 8.0. It is critical to start with the project scaffold and core systems before proceeding to individual game entities like the player, weapons, and enemies.
- Data-First Approach: Instruct the AI to first create the complete set of JSON data structures defined in Section 5.0. This ensures that all subsequent game logic is driven by external configuration from the very beginning, a core architectural principle of this project.
- Component-Based Generation: Request the creation of one React component at a time (e.g., "Create the Player component based on section 6.1"). This modular approach is more manageable for the AI, produces cleaner code, and simplifies debugging.
- Iterative Testing: After each major system or component is built (e.g., Player movement is functional, a single weapon fires correctly), instruct the AI to generate a simple test scene or scenario to verify its functionality before moving on to the next task.

These instructions provide the high-level orchestration strategy. The remainder of this document contains the detailed technical specifications and logic intended for direct execution by the AI agent.

2.0 Core Vision and Design Pillars

Before any code is written, the AI must internalize the foundational design pillars that guide every mechanical and aesthetic decision. This understanding is crucial to ensure the final product is not merely a functional clone but a cohesive, satirical experience that fulfills its creative vision.

2.1 Vision Statement

Demographia is a comedic, satirical survival game that uses the addictive, accessible "Vampire Survivors" gameplay loop as a vehicle for sharp cultural commentary on modern Israeli society. Players will navigate a chaotic, exaggerated version of Israel, surviving endless waves of humorous stereotypes and cultural phenomena, transforming the mundane into the menacing for a uniquely hilarious and replayable experience.

2.2 Core Design Pillars

- Satirical Chaos: The core gameplay loop of surviving against ever-growing, endless hordes serves as a perfect mechanical metaphor for the overwhelming chaos of daily life in Israel. Every enemy, weapon, and upgrade is a caricature drawn from a recognizable facet of the culture, turning the player's struggle into a running gag.
- Accessible Gameplay, Deep References: By intentionally mirroring the well-established mechanics of Vampire Survivors, the game is instantly intuitive. This accessibility allows players to immediately focus on the game's true purpose: the humor and cultural references. The depth comes not from complex controls, but from appreciating the layers of satire.
- Unapologetically Israeli: Every element is steeped in local culture. The protagonist is a national icon, weapons are everyday objects, enemies are social archetypes, and meta-upgrades are political puns. The UI and all text are in Hebrew, creating total immersion in this hyper-real, comedic reflection of Israel.

These pillars directly inform the specific technical architecture, data-driven design, and gameplay systems that follow.

3.0 Core Technical Architecture

The strategic importance of a well-defined architecture cannot be overstated for a game of this genre, which must handle a high entity count while maintaining performance. The following principles and technology stack are chosen specifically to ensure performance, maintainability, and full alignment with a modern React-based workflow.

3.1 Architectural Principles

1. Component-Based & Declarative: All game entities—including the Player, Enemies, Projectiles, and Pickups—will be implemented as self-contained React components. This approach leverages React Three Fiber's declarative syntax, resulting in a highly readable, modular, and maintainable codebase.
2. State-Driven Logic: All critical game state (e.g., player health, inventory, run timer, enemy positions) will be managed centrally in a dedicated state management library (Zustand). This ensures predictable state updates and creates a clean separation between the game's logic and its rendering layer.
3. Performance by Design: The architecture will prioritize performance from the outset to handle the high entity count. This is achieved through proven techniques like geometry instancing for numerous projectiles and pickups, and by offloading all collision detection and physics simulation to a high-performance, dedicated physics engine (@react-three/rapier).

3.2 Recommended Technology Stack

- Rendering: React Three Fiber
  - Justification: The core renderer for creating Three.js scenes declaratively within a React application. It forms the foundation of the entire project, enabling a component-based approach to 3D/2D game development.
- Helpers & Controls: drei
  - Justification: A rich collection of production-ready helpers, abstractions, and camera controls that significantly accelerates development by solving common R3F challenges out of the box.
- Physics: @react-three/rapier
  - Justification: A performant WebAssembly-based physics engine wrapper for R3F. It is ideal for handling hundreds of dynamic rigid bodies for collision detection with minimal impact on the main thread.
- State Management: Zustand
  - Justification: A minimalist, fast, and unopinionated state management solution perfect for managing complex game state without the boilerplate of traditional state managers like Redux.
- Game Logic Animation: useFrame Hook
  - Justification: R3F's native hook provides direct, optimized access to the render loop. It is the ideal place for all continuous game logic updates, such as sprite animation, projectile movement, and weapon cooldown timers.
- UI/Tween Animation: GSAP or Framer Motion
  - Justification: A dedicated library for handling non-render-loop animations like menu transitions and button feedback. This separates UI effects from core game logic, improving performance and maintainability.

This architecture will be powered by a set of external data structures that define all game content and behavior.

4.0 Asset Pipeline and Management

A clear asset pipeline is critical for performance and organization in a 2D game rendered within a 3D R3F scene. To minimize draw calls, optimize texture loading, and streamline animation, all visual and audio assets must be managed according to the following specifications.

4.1 Asset Manifest

The AI must acknowledge the complete file list from generated_placeholders_manifest.txt. This list defines all required assets, categorized as follows: UI backgrounds (e.g., bg/tel_aviv_loop.png, bg/char_select.png), music tracks (music/tel_aviv_theme.wav), sound effects (sfx/chest_open.wav), and spritesheets for all game entities (e.g., sprites/characters_32x32.png, sprites/items_32x32.png, sprites/portraits_64x64.png).

4.2 Spritesheet and Animation Mapping

The R3F pipeline requires a structured approach to animation to ensure performance.

- Spritesheets: All animated entities (e.g., the player, enemies) must be contained on single spritesheets per entity. This optimizes texture loading and is essential for efficient texture management in a WebGL context.
- Animation Maps: A corresponding JSON file, animation_maps.json, must be created to define the animation data for each spritesheet. This file will map animation names to their specific frame indices and timings.

For example, the entry for the "שרוליק" character should be structured as follows:

{
"שרוליק": {
"idle": {
"frames": [0, 1],
"duration": 500
},
"walk": {
"frames": [2, 3, 4, 5],
"duration": 400
}
}
}

These structured assets will be referenced by the data-driven game entities defined in the next section.

5.0 Data-Driven Design: JSON Configuration

A core architectural principle of this project is that all game data—from UI text strings to enemy health statistics—must be externalized into JSON configuration files. This data-driven approach is crucial for promoting flexibility, simplifying content updates, and allowing for rapid iteration of game balance without modifying the core codebase.

5.1 Character Configuration (characters.json)

Each character object must conform to the following structure. The initial implementation will contain a single entry for "שרוליק".

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

5.2 Weapon Configuration (weapons.json)

Each weapon object will define its base stats, upgrades, and evolution path. The five initial weapons must be included.

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
"upgrades": [
// NOTE: Level 2-N upgrade path to be defined.
]
},
{
"id": "weapon_kaparot",
"name": "כפרות",
"description": "Chickens circle the player.",
"baseDamage": 8,
"baseCooldown": null,
"evolution": "סליחות לא קדושות",
"upgrades": [
// NOTE: Level 2-N upgrade path to be defined.
]
},
{
"id": "weapon_pitas",
"name": "פיתות",
"description": "Arcs of pita bread are lobbed upwards.",
"baseDamage": 15,
"baseCooldown": 2.5,
"evolution": "בורקס המוות",
"upgrades": [
// NOTE: Level 2-N upgrade path to be defined.
]
},
{
"id": "weapon_star_of_david",
"name": "מגן דוד",
"description": "Fires a sharp Star of David in the facing direction.",
"baseDamage": 7,
"baseCooldown": 1.0,
"evolution": "אלף חיתוכים",
"upgrades": [
// NOTE: Level 2-N upgrade path to be defined.
]
}
]

5.3 Enemy Configuration (enemies.json)

Each enemy object defines its combat and reward properties.

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

5.4 Enemy Wave Configuration (waves.json)

The wave manager will be driven by a timeline-based JSON array. Each object defines a spawn event.

[
{ "time": "00:00", "enemy": "enemy_street_cats", "count": 10 },
{ "time": "00:15", "enemy": "enemy_arsim", "count": 5 },
{ "time": "00:30", "enemy": "enemy_street_cats", "count": 20 }
]

5.5 UI and Localization (ui.json)

All user-facing text must be stored in this file to facilitate localization and content changes.

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

These JSON files constitute the single source of truth for game content and must be loaded into the central Zustand state manager at runtime.

6.0 Game Systems Implementation

This section details the specific implementation logic for the core gameplay systems. The AI must build each system as a collection of modular React components. These components will read their configuration from the loaded JSON files and manage their dynamic state via the central Zustand store.

6.1 Player System

The Player Character component ("שרוליק") is the central entity controlled by the user.

- State: The player's core state properties must be managed within the Zustand store.

Property Type Description
health number The player's current health points.
maxHealth number The player's maximum health points.
moveSpeed number The base speed at which the player moves.
armor number Flat damage reduction value.
luck number Influences random chances (e.g., critical hits, chest rewards).
magnetRange number The range at which XP gems are attracted.
activeWeapons Array A list of weapon IDs currently equipped by the player.
passiveItems Array A list of passive item IDs currently held by the player.

- Component Logic: Movement will be implemented by reading keyboard input (WASD or arrow keys) within the useFrame hook. This input will be translated into a velocity vector that is applied directly to the character's Rapier RigidBody. The Magnet stat will be implemented as a separate, larger sensor collider attached to the player's physics body. When XP Gem entities enter this sensor's range, a force will be applied to pull them toward the player.

  6.2 Weapon & Stat System

Weapons are auto-firing components that scale based on player stats and level-ups.

- Weapon Firing: Individual weapon components (e.g., <SabraWeapon>) will read their baseCooldown and baseDamage from the JSON configuration. A useFrame hook will manage an internal timer. When the timer exceeds the cooldown, the weapon will fire and reset the timer.
- Targeting: The targeting logic must vary by weapon type. Auto-targeting weapons like "צבר" (Magic Wand equivalent) should perform a check for the nearest enemy entity and fire a projectile in that direction. Directional weapons like "מגן דוד" (Knife equivalent) must fire in the direction the player is currently facing, derived from the player's last movement vector.
- Stat Mechanics: The core damage formula must adhere to the following principles. Player stats like "Might" (עוצמה יהודית) are percentage-based modifiers applied to a weapon's innate base damage. For example: "At 100% Might, a weapon with 5 base damage deals 5 damage. At 200% Might, it deals 10 damage." Conversely, "Armor" (פרוטקשן) is a flat numerical reduction to incoming damage.

  6.3 Enemy System

Enemy entities are spawned dynamically and controlled by simple AI behaviors.

- Base Component: A single, reusable <Enemy> component must be created. This component will accept properties such as health, moveSpeed, damage, and spriteKey from its configuration, which is passed down from the WaveManager.
- Behavior: The default enemy behavior is a simple "move towards player" logic. In each frame, the enemy will calculate the vector pointing from its current position to the player's position, normalize it, and apply a velocity in that direction scaled by its moveSpeed. More complex behaviors for enemies like shooters (חיילים) will require additional state logic (e.g., a "firing" state with a separate cooldown).
- Spawning: A WaveManager system must be created. This system reads the waves.json file and monitors the game's central run timer. When the timer matches a time entry in the wave data, the WaveManager will spawn the specified count of the designated enemy type at random positions outside the player's view.

  6.4 UI and Screen Flow

The game's UI screens must be implemented as separate, modular React components, following the flow detailed in the product requirements document.

- Main Menu: Implement a component that displays the primary navigation buttons: "שחק" (Play), "חנות שדרוגים" (Meta-Shop), etc.
- Character & Stage Selection: Implement components using grid and horizontal carousel layouts, respectively, to display selectable characters and stages.
- In-Game HUD: Create the in-game HUD component. Its layout must be precise: the run timer in the top center, the player's level (מספר רמה) and XP bar in the top left, and the current gold count (מטבעות זהב) in the top right. Vertical icon lists for weapons and passive items must be on the left and right sides of the screen, respectively. Crucially, all text labels must be populated dynamically from the ui.json configuration file.

These systems, once implemented, will form the foundation of the core gameplay loop and progression mechanics.

7.0 Game Loop and Progression

This section outlines the primary gameplay loop from the player's perspective, covering the 30-minute cycle of survival, leveling, and permanent upgrades. The AI must implement the systems that govern this cycle.

7.1 The 30-Minute Run

The core in-run progression is a cycle of defeating enemies and growing stronger.

1. Experience and Leveling: Defeating enemies causes them to drop XP gems ("נקודות"). When the player collects these gems, an XP bar fills. Once the bar is full, the player levels up, the game pauses, and the level-up selection screen appears.
2. Item Acquisition: Upon leveling up, the player is presented with a random selection of three to four cards, offering new weapons, new passive items, or upgrades to existing ones. The player chooses one to acquire.
3. Bosses and Chests: Elite enemies and bosses, which spawn at specific time intervals, drop treasure chests ("פיצויים") upon defeat. Opening a chest grants the player one or more items and has a chance to trigger a weapon evolution if the correct combination of a max-level weapon and a specific passive item is held.
4. End of Run: At the 30-minute mark, a special "Final Killer" enemy ("מלאך המוות") spawns. This enemy is exceptionally powerful and designed to inevitably end the run, concluding the 30-minute survival challenge.

7.2 Meta-Progression

Systems must be implemented to provide progression that persists between runs.

- Gold Economy: During runs, players will collect Gold Coins ("מטבעות זהב") from defeated enemies and treasure chests. This currency is retained after the run ends.
- Meta-Shop: A meta-shop screen must be implemented, accessible from the main menu. Here, players can spend their collected gold on permanent upgrades (Power-Ups). These upgrades, such as Might ("עוצמה יהודית") and Armor ("פרוטקשן"), permanently increase the player character's base stats at the start of every new run.

This loop provides both the short-term challenge of a single run and the long-term engagement of permanent upgrades. Now, it's time to assemble these systems piece by piece.

8.0 Phased Implementation Plan for AI Agent

To ensure a stable and logical development process, the game must be constructed according to the following phased plan. Each phase represents a distinct, testable milestone that builds upon the previous one.

Phase 1: Project Scaffolding and Core Systems

1. Project Setup: Create a new React + TypeScript project using the Vite build tool.
2. Install Dependencies: Add the core libraries defined in the technology stack: three, @react-three/fiber, @react-three/drei, @react-three/rapier, and zustand.
3. Basic Scene: Create a main game component that renders an R3F <Canvas>, a simple <Plane> for the ground, and sets up an orthographic camera with controls suitable for a top-down, 2D-style game.
4. State Management: Set up the initial Zustand store. Create slices with placeholder values for player state (e.g., health, maxHealth), game state (e.g., runTimer, isPaused), and a list for active enemies.

Phase 2: Player Implementation

1. Component Creation: Build the <Player> React component.
2. Physics and Movement: Integrate a Rapier RigidBody within the <Player> component. Implement keyboard controls inside a useFrame hook to read input and apply velocity to the physics body for movement.
3. Rendering: Render the player as a simple textured plane. Use a single frame from the sprites/characters_32x32.png spritesheet as a placeholder texture.

Phase 3: A Single Weapon System

1. Data Integration: Create and populate the weapons.json file with the configuration data for the "מגן דוד" (Knife) weapon.
2. Component Creation: Build a generic, reusable <Projectile> component that can be rendered with a texture and moved via its own physics body.
3. Weapon Logic: Create a <KnifeWeapon> component. This component will use a useFrame hook to manage its cooldown timer based on the loaded JSON data. When the timer completes, it should spawn a <Projectile> component and apply an initial velocity in the player's current facing direction.
4. State Integration: Connect the weapon system to the player state in the Zustand store, allowing the player to have an "active" weapon that is rendered and updated.

Phase 4: A Single Enemy System

1. Data Integration: Create and populate enemies.json and waves.json with data for the "חתולי רחוב" (Street Cats) enemy.
2. Component Creation: Build the reusable <Enemy> component, which includes its own Rapier RigidBody.
3. Behavior: Implement the simple "move towards player" AI within the enemy's useFrame hook.
4. Spawning: Build the WaveManager component. It will read the waves.json file and, based on the runTimer from the Zustand store, spawn instances of the <Enemy> component.
5. Collision: Implement basic collision event handling using Rapier. Projectiles should destroy enemies upon contact, and enemies should deal damage to the player upon contact.

Phase 5: UI and Game Loop

1. HUD: Build the in-game HUD component. It must connect to the Zustand store to display the real-time run timer and player health.
2. Main Menu: Create the main menu screen component with a functional "Play" button. Clicking this button should reset the game state and transition the view to the main game scene.
3. Game Over: Implement the core game loop logic. When the player's health in the Zustand store reaches zero, the game should transition to a simple "Game Over" screen, ending the run.
