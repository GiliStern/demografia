import type { Meta, StoryObj } from "@storybook/react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Sprite } from "./Sprite";
import { sprites } from "../assets/assetPaths";
import { CHARACTERS } from "../data/config/characters";
import { ENEMIES } from "../data/config/enemies";
import { WEAPONS } from "../data/config/weaponsConfig";
import { CharacterId, EnemyId, WeaponId } from "../types";
import { useEffect, useState } from "react";

// Wrapper component for animation
const AnimatedSprite = ({
  textureUrl,
  scale = 2,
  spriteFrameSize = 32,
  flipX = false,
  animationSpeed = 200,
  frames = [0, 1],
}: {
  textureUrl: string;
  scale?: number;
  spriteFrameSize?: number;
  flipX?: boolean;
  animationSpeed?: number;
  frames?: number[];
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  useEffect(() => {
    if (frames.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [animationSpeed, frames]);

  return (
    <Sprite
      textureUrl={textureUrl}
      index={frames[currentFrameIndex] ?? 0}
      scale={scale}
      spriteFrameSize={spriteFrameSize}
      flipX={flipX}
    />
  );
};

// Story wrapper with Canvas
const SpriteWrapper = ({
  textureUrl,
  scale = 2,
  spriteFrameSize = 32,
  flipX = false,
  animated = false,
  animationSpeed = 200,
  frames = [0, 1],
  staticFrame = 0,
  showGrid = true,
  cameraDistance = 5,
}: {
  textureUrl: string;
  scale?: number;
  spriteFrameSize?: number;
  flipX?: boolean;
  animated?: boolean;
  animationSpeed?: number;
  frames?: number[];
  staticFrame?: number;
  showGrid?: boolean;
  cameraDistance?: number;
}) => {
  return (
    <div style={{ width: "100%", height: "600px" }}>
      <Canvas
        camera={{ position: [0, 0, cameraDistance], fov: 50 }}
        gl={{ alpha: true }}
      >
        <color attach="background" args={["#1a1a1a"]} />
        <ambientLight intensity={1} />
        
        {animated ? (
          <AnimatedSprite
            textureUrl={textureUrl}
            scale={scale}
            spriteFrameSize={spriteFrameSize}
            flipX={flipX}
            animationSpeed={animationSpeed}
            frames={frames}
          />
        ) : (
          <Sprite
            textureUrl={textureUrl}
            index={staticFrame}
            scale={scale}
            spriteFrameSize={spriteFrameSize}
            flipX={flipX}
          />
        )}
        
        {showGrid && <gridHelper args={[10, 10]} />}
        <OrbitControls />
      </Canvas>
    </div>
  );
};

const meta = {
  title: "Components/Sprite",
  component: SpriteWrapper,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Sprite Component

A React Three Fiber component for rendering sprite sheets with animation support.

## Features
- Supports multiple sprite sheets with different frame sizes
- Flip sprites horizontally
- Animate sprites with custom frame sequences (e.g., [0, 1, 2] or [3, 4] for specific directions)
- Adjustable scale and animation speed
- Full 3D camera controls (orbit, zoom, pan)

## Available Sprites

### Characters
- **Srulik** - Main character (256px frames, scale 2)

### Enemies
- **Cat** - Street cat sprite (170px frames, scale 2)
- **Hipster** - Hipster character (116px frames, scale 3)
- **Tourist** - Tourist character (256px frames, scale 3)
- **Scooter Swarm** - Scooter sprite (512px frames, scale 3)
- **Tiktok Star** - Tiktok influencer (512px frames, scale 3)

### Weapons (Base)
- **Sabra** - Prickly pear projectile (512px frames, scale 1.5)
- **Keter Chairs** - Flying chair (512px frames, scale 3)
- **Kaparot** - Chicken orbital (512px frames, scale 1)
- **Pitas** - Pita arc projectile (512px frames, scale 1)
- **Star of David** - Star projectile (512px frames, scale 1)

### Weapons (Evolved)
- **Holy Cactus** - Evolved Sabra (512px frames, scale 1)
- **No Future** - Evolved Keter Chairs (512px frames, scale 1)
- **Unholy Selichot** - Evolved Kaparot (512px frames, scale 1)
- **Burekas of Death** - Evolved Pitas (512px frames, scale 1)
- **Thousand Edge** - Evolved Star of David (512px frames, scale 1)
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    textureUrl: {
      control: "select",
      options: Object.keys(sprites),
      mapping: sprites,
      description: "Select which sprite sheet to display",
    },
    scale: {
      control: { type: "range", min: 0.5, max: 10, step: 0.5 },
      description: "Scale of the sprite",
    },
    spriteFrameSize: {
      control: { type: "number" },
      description: "Size of each frame in the sprite sheet (in pixels)",
    },
    flipX: {
      control: "boolean",
      description: "Flip sprite horizontally",
    },
    animated: {
      control: "boolean",
      description: "Enable walking animation",
    },
    animationSpeed: {
      control: { type: "range", min: 50, max: 1000, step: 50 },
      description: "Animation speed in milliseconds per frame",
      if: { arg: "animated", truthy: true },
    },
    frames: {
      control: "object",
      description: "Array of frame indexes to animate through (e.g., [0, 1, 2, 3] or [3, 4] for walking up)",
      if: { arg: "animated", truthy: true },
    },
    staticFrame: {
      control: { type: "number", min: 0, max: 10, step: 1 },
      description: "Frame index to display when not animated",
      if: { arg: "animated", truthy: false },
    },
    showGrid: {
      control: "boolean",
      description: "Show grid helper",
    },
    cameraDistance: {
      control: { type: "range", min: 2, max: 20, step: 1 },
      description: "Camera distance from sprite",
    },
  },
} satisfies Meta<typeof SpriteWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;


const catSpriteConfig = ENEMIES[EnemyId.StreetCats].sprite_config;
// Default story
export const Default: Story = {
  args: {
    textureUrl: catSpriteConfig.textureUrl,
    scale: catSpriteConfig.scale,
    spriteFrameSize: catSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: false,
    staticFrame: 0,
    animationSpeed: 200,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 5,
  },
};


// Cat Walking
export const CatWalking: Story = {
  args: {
    textureUrl: catSpriteConfig.textureUrl,
    scale: catSpriteConfig.scale,
    spriteFrameSize: catSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 200,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 5,
  },
};

const srulikSpriteConfig = CHARACTERS[CharacterId.Srulik].sprite_config;
// Srulik Character
export const SrulikCharacter: Story = {
  args: {
    textureUrl: srulikSpriteConfig.textureUrl,
    scale: srulikSpriteConfig.scale,
    spriteFrameSize: srulikSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: false,
    staticFrame: 0,
    animationSpeed: 200,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 5,
  },
};


// Srulik Walking
export const SrulikWalking: Story = {
  args: {
    textureUrl: srulikSpriteConfig.textureUrl,
    scale: srulikSpriteConfig.scale,
    spriteFrameSize: srulikSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 150,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 5,
  },
};

// Srulik Walking Up
export const SrulikWalkingUp: Story = {
  args: {
    textureUrl: srulikSpriteConfig.textureUrl,
    scale: srulikSpriteConfig.scale,
    spriteFrameSize: srulikSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 150,
    frames: [2, 3],
    showGrid: true,
    cameraDistance: 5,
  },
};

const hipsterSpriteConfig = ENEMIES[EnemyId.Hipster].sprite_config;
// Hipster
export const Hipster: Story = {
  args: {
    textureUrl: hipsterSpriteConfig.textureUrl,
    scale: hipsterSpriteConfig.scale,
    spriteFrameSize: hipsterSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: false,
    staticFrame: 0,
    animationSpeed: 200,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 5,
  },
};

// Hipster Walking
export const HipsterWalking: Story = {
  args: {
    textureUrl: hipsterSpriteConfig.textureUrl,
    scale: hipsterSpriteConfig.scale,
    spriteFrameSize: hipsterSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 250,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 5,
  },
};

const touristSpriteConfig = ENEMIES[EnemyId.Tourist].sprite_config;
// Tourist
export const Tourist: Story = {
  args: {
    textureUrl: touristSpriteConfig.textureUrl,
    scale: touristSpriteConfig.scale,
    spriteFrameSize: touristSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: false,
    staticFrame: 0,
    animationSpeed: 200,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 5,
  },
};

// Tourist Walking
export const TouristWalking: Story = {
  args: {
    textureUrl: touristSpriteConfig.textureUrl,
    scale: touristSpriteConfig.scale,
    spriteFrameSize: touristSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 300,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 6,
  },
};

const scooterSwarmSpriteConfig = ENEMIES[EnemyId.ScooterSwarm].sprite_config;
// Scooter Swarm
export const ScooterSwarm: Story = {
  args: {
    textureUrl: scooterSwarmSpriteConfig.textureUrl,
    scale: scooterSwarmSpriteConfig.scale,
    spriteFrameSize: scooterSwarmSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 100,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 6,
  },
};

const tiktokStarSpriteConfig = ENEMIES[EnemyId.TiktokStar].sprite_config;
// TikTok Star
export const TiktokStar: Story = {
  args: {
    textureUrl: tiktokStarSpriteConfig.textureUrl,
    scale: tiktokStarSpriteConfig.scale,
    spriteFrameSize: tiktokStarSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 150,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 6,
  },
};

const keterChairsSpriteConfig = WEAPONS[WeaponId.KeterChairs].sprite_config;
// Chair
export const Chair: Story = {
  args: {
    textureUrl: keterChairsSpriteConfig.textureUrl,
    scale: keterChairsSpriteConfig.scale,
    spriteFrameSize: keterChairsSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 100,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 5,
  },
};

const kaparotSpriteConfig = WEAPONS[WeaponId.Kaparot].sprite_config;

// Chicken
export const Chicken: Story = {
  args: {
    textureUrl: kaparotSpriteConfig.textureUrl,
    scale: kaparotSpriteConfig.scale,
    spriteFrameSize: kaparotSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 150,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 5,
  },
};

const pitasSpriteConfig = WEAPONS[WeaponId.Pitas].sprite_config;
// Pita
export const Pita: Story = {
  args: {
    textureUrl: pitasSpriteConfig.textureUrl,
    scale: pitasSpriteConfig.scale,
    spriteFrameSize: pitasSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 100,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 5,
  },
};

const sabraSpriteConfig = WEAPONS[WeaponId.Sabra].sprite_config;
// Prickly
export const Prickly: Story = {
  args: {
    textureUrl: sabraSpriteConfig.textureUrl,
    scale: sabraSpriteConfig.scale,
    spriteFrameSize: sabraSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 200,
    frames: [0],
    showGrid: true,
    cameraDistance: 5,
  },
};

const starOfDavidSpriteConfig = WEAPONS[WeaponId.StarOfDavid].sprite_config;
// Star of David
export const StarOfDavid: Story = {
  args: {
    textureUrl: starOfDavidSpriteConfig.textureUrl,
    scale: starOfDavidSpriteConfig.scale,
    spriteFrameSize: starOfDavidSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 100,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 5,
  },
};

// Flipped sprite example
export const FlippedSprite: Story = {
  args: {
    textureUrl: catSpriteConfig.textureUrl,
    scale: catSpriteConfig.scale,
    spriteFrameSize: catSpriteConfig.spriteFrameSize ?? 32,
    flipX: true,
    animated: true,
    animationSpeed: 200,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 5,
  },
};

// Large scale example
export const LargeScale: Story = {
  args: {
    textureUrl: srulikSpriteConfig.textureUrl,
    scale: 8,
    spriteFrameSize: srulikSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 200,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 10,
  },
};

// Fast animation
export const FastAnimation: Story = {
  args: {
    textureUrl: scooterSwarmSpriteConfig.textureUrl,
    scale: scooterSwarmSpriteConfig.scale,
    spriteFrameSize: scooterSwarmSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 50,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 6,
  },
};

// Slow animation
export const SlowAnimation: Story = {
  args: {
    textureUrl: touristSpriteConfig.textureUrl,
    scale: touristSpriteConfig.scale,
    spriteFrameSize: touristSpriteConfig.spriteFrameSize ?? 32,
    flipX: false,
    animated: true,
    animationSpeed: 500,
    frames: [0, 1],
    showGrid: true,
    cameraDistance: 6,
  },
};
