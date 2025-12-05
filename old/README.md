# Hebrew Vampire Survivors

A comedic Hebrew-themed bullet hell survival game inspired by Vampire Survivors, set in Israeli locations with humorous local references.

## 🎮 Game Features

### Core Gameplay
- **Survival Mode**: Survive waves of enemies for up to 30 minutes
- **Character Progression**: Level up to unlock new weapons and abilities
- **Multiple Characters**: Play as different iconic characters with unique starting weapons
- **Dynamic Difficulty**: Enemy waves increase in intensity over time
- **Hebrew Localization**: Full RTL (Right-to-Left) UI support with Hebrew text

### Weapons & Combat
- **Unique Hebrew-Themed Weapons**:
  - **צבר (Tzabar)**: Shoots prickly pear cactus fruits
  - **כסאות כתר (Keter Chairs)**: Boomerang plastic chairs
  - **כפרות (Kapparot)**: Orbiting chickens for protection
  - **פיתות (Pita)**: Thrown pita bread in arcs
  - **מגן דוד (Magen David)**: Rapid-fire Stars of David

### Stages
- **רחובות תל אביב (Tel Aviv Streets)**: Urban setting with bikes, graffiti, and street life
- **ירושלים העתיקה (Old Jerusalem)**: Ancient stone alleys with historical atmosphere

### Enemies
Comedic Israeli-themed enemies including:
- Street cats (חתולי רחוב)
- Hipsters (היפסטרים)
- Tourists (תיירים)
- TikTok influencers (טיקטוקיסטים)
- Scooter swarms (נחיל קורקינטים)

### Meta Progression
- **Gold System**: Earn gold to buy permanent upgrades
- **Achievement System**: Complete challenges for rewards
- **Character Unlocks**: Progress to unlock new playable characters
- **Save System**: Local storage for progress and settings

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Local web server (for development)

### Installation
1. Clone or download the project files
2. Start a local web server in the project directory:
   ```bash
   # Using Python 3
   python3 -m http.server 8080
   
   # Using Node.js
   npx http-server -p 8080
   
   # Using PHP
   php -S localhost:8080
   ```
3. Open your browser and navigate to `http://localhost:8080`

### Controls
- **Movement**: WASD or Arrow Keys
- **Pause**: Escape key
- **Debug Mode**: F3 key
- **Mute**: Ctrl+M
- **Mobile**: Touch controls automatically appear on mobile devices

## 🛠️ Technical Details

### Architecture
- **HTML5 Canvas**: Core rendering engine
- **Modular JavaScript**: Clean separation of concerns
- **JSON Configuration**: All game data externalized for easy modification
- **Responsive Design**: Scales to different screen sizes
- **Progressive Enhancement**: Works without audio/advanced features

### File Structure
```
demografia/
├── index.html                 # Main HTML file
├── style.css                 # Game styles and animations
├── js/                       # JavaScript modules
│   ├── main.js              # Main game controller
│   ├── config.js            # Configuration loader
│   ├── utils.js             # Utility functions
│   ├── input.js             # Input handling
│   ├── audio.js             # Audio system
│   ├── sprites.js           # Sprite management
│   ├── ui.js                # UI system
│   ├── saveSystem.js        # Save/load functionality
│   ├── screens.js           # Screen management
│   ├── gameEngine.js        # Core game engine
│   ├── entities.js          # Game entities
│   ├── weapons.js           # Weapon systems
│   └── particles.js         # Visual effects
└── hebrew_vampire_survivors_package/
    ├── game_assets_hebrew_template_v0_2.json  # Game configuration
    ├── music/               # Audio files (placeholder)
    ├── sfx/                # Sound effects (placeholder)
    └── sprites/            # Game sprites (placeholder)
```

### Features
- **RTL Support**: Proper Hebrew text rendering and UI layout
- **Pixel Art Rendering**: Crisp pixel art graphics with proper scaling
- **Particle System**: Rich visual effects for combat and interactions
- **Screen Shake**: Juicy game feel with impact effects
- **Smooth Animations**: CSS and JavaScript animations for polish
- **Touch Support**: Mobile-friendly virtual controls
- **Debug Mode**: Built-in debugging tools for development

## 🎨 Customization

### Adding New Content
The game is designed to be easily customizable through the JSON configuration file:

1. **New Characters**: Add entries to the `characters` array
2. **New Weapons**: Define new weapons in the `weapons` object
3. **New Enemies**: Add enemy types to stage configurations
4. **New Stages**: Create new stage definitions with custom enemies and themes
5. **Localization**: Update the `ui_strings` object for different languages

### Art Assets
The game includes a placeholder sprite generation system that creates 8-bit style graphics automatically. Replace these with custom sprites by:

1. Adding image files to the appropriate directories
2. Updating the `assets` section in the JSON configuration
3. Modifying sprite paths in the code

## 🐛 Debug Features

### Debug Console Commands
Access via browser console with `gameDebug` object:
- `gameDebug.addGold(amount)` - Add gold to player
- `gameDebug.addXP(amount)` - Add experience points
- `gameDebug.spawnEnemies(count)` - Spawn enemies for testing
- `gameDebug.toggleInvincibility()` - Make player invincible
- `gameDebug.goto(screen)` - Navigate to specific screen

### Debug Mode (F3)
- FPS counter
- Entity counts
- Player position
- Game state information
- Collision visualization

## 📝 Development Notes

### Performance Optimizations
- Entity pooling for particles and projectiles
- Efficient collision detection
- Canvas optimization techniques
- Memory management for long gameplay sessions

### Browser Compatibility
- Modern browsers (ES6+ features used)
- Mobile browsers with touch support
- Graceful degradation for older browsers

### Known Limitations
- Audio requires user interaction to start (browser limitation)
- Canvas rendering performance varies by device
- Some features may not work in very old browsers

## 🤝 Contributing

This is a complete, playable game built as requested. The codebase is well-structured for modifications and extensions.

### Suggested Improvements
- Add more characters and stages
- Implement weapon evolution system
- Add boss battles with unique mechanics
- Create more particle effects
- Add sound effects and music
- Implement multiplayer features

## 📄 License

This project is built as a demonstration of game development techniques. All Israeli cultural references are used respectfully and humorously.

## 🎯 Credits

- Inspired by Vampire Survivors game mechanics
- Hebrew localization and cultural themes
- Pixel art style placeholder graphics
- Professional game development patterns

---

**Enjoy playing Hebrew Vampire Survivors! 🇮🇱🎮**

The game should load automatically when you open index.html in a web browser. Use F3 for debug mode and check the browser console for any issues.

