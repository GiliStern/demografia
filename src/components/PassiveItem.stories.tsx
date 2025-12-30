import type { Meta, StoryObj } from "@storybook/react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Sprite } from "./Sprite";
import { passiveSprites, placeholders } from "../assets/assetPaths";
import { PASSIVES } from "../data/config/passives";
import { PassiveId } from "../types";

// Static sprite wrapper for passive items (they don't animate)
const PassiveSpriteWrapper = ({
  textureUrl,
  scale = 3,
  showGrid = true,
  cameraDistance = 5,
  name,
  spriteFrameSize = 256,
}: {
  textureUrl: string;
  scale?: number;
  showGrid?: boolean;
  cameraDistance?: number;
  name?: string;
  spriteFrameSize?: number;
}) => {
  return (
    <div style={{ width: "100%", height: "400px", position: "relative" }}>
      {name && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            color: "#fff",
            fontSize: "1.2rem",
            zIndex: 1,
            background: "rgba(0,0,0,0.5)",
            padding: "5px 10px",
            borderRadius: "4px",
          }}
        >
          {name}
        </div>
      )}
      <Canvas
        camera={{ position: [0, 0, cameraDistance], fov: 50 }}
        gl={{ alpha: true }}
      >
        <color attach="background" args={["#1a1a1a"]} />
        <ambientLight intensity={1} />
        <Sprite
          textureUrl={textureUrl}
          index={0}
          scale={scale}
          spriteFrameSize={spriteFrameSize}
        />
        {showGrid && <gridHelper args={[10, 10]} />}
        <OrbitControls />
      </Canvas>
    </div>
  );
};

// Gallery component to show all passive items
const PassiveGallery = () => {
  const allPassives = Object.values(PASSIVES);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "20px",
        padding: "20px",
        background: "#111",
      }}
    >
      {allPassives.map((passive) => (
        <div
          key={passive.id}
          style={{
            background: "#222",
            borderRadius: "8px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          <div style={{ height: "150px" }}>
            <Canvas
              camera={{ position: [0, 0, 4], fov: 50 }}
              gl={{ alpha: true }}
            >
              <color attach="background" args={["#333"]} />
              <ambientLight intensity={1} />
              <Sprite
                textureUrl={passive.sprite_config.textureUrl}
                index={0}
                scale={2}
                spriteFrameSize={passive.sprite_config.spriteFrameSize ?? 256}
              />
            </Canvas>
          </div>
          <div style={{ color: "#fff", marginTop: "10px" }}>
            <strong>{passive.name_he}</strong>
          </div>
          <div style={{ color: "#aaa", fontSize: "0.85rem" }}>
            {passive.description_he}
          </div>
          <div style={{ color: "#6af", fontSize: "0.75rem", marginTop: "5px" }}>
            מקסימום רמה: {passive.maxLevel}
          </div>
        </div>
      ))}
    </div>
  );
};

const meta = {
  title: "Components/PassiveItems",
  component: PassiveSpriteWrapper,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Passive Items

Passive items that can be collected during gameplay to enhance player stats.
Based on Vampire Survivors mechanics, each item can be leveled up to level 5.

## Available Passive Items

### With Custom Graphics
- **גת (Gat)** - Spinach equivalent: +10% Might per level
- **פרוטקשן (Protection)** - Armor equivalent: +1 Armor per level
- **פריווילגיה (Privilege)** - Hollow Heart equivalent: +20% Max Health per level
- **מד"א (MDA)** - Pummarola equivalent: +0.2 Recovery per level
- **ווסאח (Wassach)** - Empty Tome equivalent: -8% Cooldown per level
- **נרות שבת (Shabbat Candles)** - Candelabrador equivalent: +10% Area per level
- **כנפי השכינה (Wings Divine)** - Wings equivalent: +10% Move Speed per level

### Using Placeholder Graphics
- **זרוע נטויה (Outstretched Arm)** - Bracer equivalent: +10% Projectile Speed per level
- *הארכה (Extension)** - Spellbinder equivalent: +10% Duration per level
- **מרבין בשמחה (Increase Joy)** - Duplicator equivalent: +1 Amount per level
- **מגנט (Magnet)** - Attractorb equivalent: +0.5 Magnet per level
- **תלתן (Clover)** - Clover equivalent: +10% Luck per level
- **כתר (Crown)** - Crown equivalent: +8% Growth per level
- **מסכת הזהב (Gold Mask)** - Stone Mask equivalent: +10% Greed per level
- **עין הרע (Evil Eye)** - Skull O'Maniac equivalent: +10% Curse per level
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    textureUrl: {
      control: "select",
      options: [
        "candles",
        "gat",
        "mda",
        "privilege",
        "protection",
        "wassach",
        "wings",
        "placeholder",
      ],
      mapping: {
        candles: passiveSprites.shabbat_candles,
        gat: passiveSprites.gat,
        mda: passiveSprites.mda,
        privilege: passiveSprites.privilege,
        protection: passiveSprites.protection,
        wassach: passiveSprites.wassach,
        wings: passiveSprites.wings_divine_presence,
        placeholder: placeholders.passive,
      },
      description: "Select which passive item sprite to display",
    },
    scale: {
      control: { type: "range", min: 1, max: 8, step: 0.5 },
      description: "Scale of the sprite",
    },
    showGrid: {
      control: "boolean",
      description: "Show grid helper",
    },
    cameraDistance: {
      control: { type: "range", min: 2, max: 10, step: 1 },
      description: "Camera distance from sprite",
    },
  },
} satisfies Meta<typeof PassiveSpriteWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    textureUrl: passiveSprites.gat,
    scale: 3,
    showGrid: true,
    cameraDistance: 5,
  },
};

// Individual passive item stories
const gatPassive = PASSIVES[PassiveId.Gat];
export const Gat: Story = {
  args: {
    textureUrl: gatPassive.sprite_config.textureUrl,
    scale: 3,
    showGrid: true,
    cameraDistance: 5,
    name: `${gatPassive.name_he} - ${gatPassive.description_he}`,
    spriteFrameSize: gatPassive.sprite_config.spriteFrameSize ?? 256,
  },
};

const protectionPassive = PASSIVES[PassiveId.Protection];
export const Protection: Story = {
  args: {
    textureUrl: protectionPassive.sprite_config.textureUrl,
    scale: 3,
    showGrid: true,
    cameraDistance: 5,
    name: `${protectionPassive.name_he} - ${protectionPassive.description_he}`,
    spriteFrameSize: protectionPassive.sprite_config.spriteFrameSize ?? 256,
  },
};

const privilegePassive = PASSIVES[PassiveId.Privilege];
export const Privilege: Story = {
  args: {
    textureUrl: privilegePassive.sprite_config.textureUrl,
    scale: 3,
    showGrid: true,
    cameraDistance: 5,
    name: `${privilegePassive.name_he} - ${privilegePassive.description_he}`,
    spriteFrameSize: privilegePassive.sprite_config.spriteFrameSize ?? 256,
  },
};

const mdaPassive = PASSIVES[PassiveId.MDA];
export const MDA: Story = {
  args: {
    textureUrl: mdaPassive.sprite_config.textureUrl,
    scale: 3,
    showGrid: true,
    cameraDistance: 5,
    name: `${mdaPassive.name_he} - ${mdaPassive.description_he}`,
    spriteFrameSize: mdaPassive.sprite_config.spriteFrameSize ?? 256,
  },
};

const wassachPassive = PASSIVES[PassiveId.Wassach];
export const Wassach: Story = {
  args: {
    textureUrl: wassachPassive.sprite_config.textureUrl,
    scale: 3,
    showGrid: true,
    cameraDistance: 5,
    name: `${wassachPassive.name_he} - ${wassachPassive.description_he}`,
    spriteFrameSize: wassachPassive.sprite_config.spriteFrameSize ?? 256,
  },
};

const candlesPassive = PASSIVES[PassiveId.ShabbatCandles];
export const ShabbatCandles: Story = {
  args: {
    textureUrl: candlesPassive.sprite_config.textureUrl,
    scale: 3,
    showGrid: true,
    cameraDistance: 5,
    name: `${candlesPassive.name_he} - ${candlesPassive.description_he}`,
    spriteFrameSize: candlesPassive.sprite_config.spriteFrameSize ?? 256,
  },
};

const wingsPassive = PASSIVES[PassiveId.WingsOfDivinePresence];
export const WingsOfDivinePresence: Story = {
  args: {
    textureUrl: wingsPassive.sprite_config.textureUrl,
    scale: 3,
    showGrid: true,
    cameraDistance: 5,
    name: `${wingsPassive.name_he} - ${wingsPassive.description_he}`,
    spriteFrameSize: wingsPassive.sprite_config.spriteFrameSize ?? 256,
  },
};

// Placeholder example
const outstretchedArmPassive = PASSIVES[PassiveId.OutstretchedArm];
export const PlaceholderExample: Story = {
  args: {
    textureUrl: outstretchedArmPassive.sprite_config.textureUrl,
    scale: 3,
    showGrid: true,
    cameraDistance: 5,
    name: `${outstretchedArmPassive.name_he} (משתמש בתמונת מחזיק מקום)`,
    spriteFrameSize:
      outstretchedArmPassive.sprite_config.spriteFrameSize ?? 256,
  },
};

// Gallery story showing all passive items
export const AllPassiveItems: StoryObj = {
  render: () => <PassiveGallery />,
  parameters: {
    docs: {
      description: {
        story: "Gallery view of all passive items in the game.",
      },
    },
  },
};
