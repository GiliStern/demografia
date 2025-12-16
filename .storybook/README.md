# Storybook Setup for Demografia

This Storybook setup showcases the Sprite component with all available graphics and animations.

## Installation

First, install the dependencies:

```bash
yarn install
```

## Running Storybook

To start Storybook in development mode:

```bash
yarn storybook
```

This will start Storybook on `http://localhost:6006`

## Building Storybook

To build a static version of Storybook:

```bash
yarn build-storybook
```

## Features

### Sprite Component Stories

The Sprite story includes:

1. **Interactive Controls**
   - Select from 11 different sprite sheets
   - Adjust scale (0.5x to 10x)
   - Toggle horizontal flip
   - Enable/disable walking animation
   - Control animation speed (50ms to 1000ms per frame)
   - Adjust frame count for animations
   - Toggle grid helper
   - Control camera distance

2. **Pre-configured Stories**
   
   **Characters & Enemies:**
   - Default (static cat sprite)
   - Cat Walking
   - Srulik Character (static)
   - Srulik Walking
   - Hipster (static)
   - Hipster Walking
   - Tourist (static)
   - Tourist Walking
   - Scooter Swarm (animated)
   - TikTok Star (animated)
   
   **Weapons (Base):**
   - Weapon Sabra (Prickly Pear)
   - Weapon Keter Chairs
   - Weapon Kaparot (Chickens)
   - Weapon Pitas
   - Weapon Star of David
   
   **Weapons (Evolved):**
   - Weapon Holy Cactus
   - Weapon No Future
   - Weapon Unholy Selichot
   - Weapon Burekas of Death
   - Weapon Thousand Edge
   
   **Special Examples:**
   - Chair (animated)
   - Chicken (animated)
   - Pita (animated)
   - Prickly (animated)
   - Star of David (animated)
   - Flipped Sprite
   - Large Scale
   - Fast Animation
   - Slow Animation

3. **3D Controls**
   - Orbit: Left mouse drag
   - Zoom: Mouse wheel
   - Pan: Right mouse drag

## Available Sprites

### Characters
| Sprite | Frame Size | Scale |
|--------|------------|-------|
| Srulik | 256px | 2 |

### Enemies
| Sprite | Frame Size | Scale |
|--------|------------|-------|
| Cat | 170px | 2 |
| Hipster | 116px | 3 |
| Tourist | 256px | 3 |
| Scooter Swarm | 512px | 3 |
| TikTok Star | 512px | 3 |

### Weapons (Base)
| Weapon | Sprite | Frame Size | Scale |
|--------|--------|------------|-------|
| Sabra | Prickly | 512px | 1.5 |
| Keter Chairs | Chair | 512px | 3 |
| Kaparot | Chicken | 512px | 1 |
| Pitas | Pita | 512px | 1 |
| Star of David | Star | 512px | 1 |

### Weapons (Evolved)
| Weapon | Sprite | Frame Size | Scale |
|--------|--------|------------|-------|
| Holy Cactus | Prickly | 512px | 1 |
| No Future | Chair | 512px | 1 |
| Unholy Selichot | Chicken | 512px | 1 |
| Burekas of Death | Pita | 512px | 1 |
| Thousand Edge | Star | 512px | 1 |

## Tips

- Use the **Controls** panel to experiment with different settings
- Try different combinations of sprites, scales, and animation speeds
- Use the camera distance control to get a better view of larger sprites
- The grid helper can be toggled for better spatial reference
- Animation speed and frame count can be adjusted to fine-tune walking cycles

