// Sprite system for handling game graphics

class SpriteManager {
  constructor() {
    this.sprites = new Map();
    this.spritesheets = new Map();
    this.loadPromises = new Map();
    this.spriteMeta = new Map();
    // Cache for Image objects converted from data URLs to avoid per-frame re-creation
    this.imageCache = new Map();
    this.placeholderCanvas = null;
    this.placeholderContext = null;

    this.initializePlaceholders();
  }

  initializePlaceholders() {
    // Create a canvas for generating placeholder sprites
    this.placeholderCanvas = document.createElement("canvas");
    this.placeholderContext = this.placeholderCanvas.getContext("2d");

    // Generate placeholder sprites based on config
    this.generatePlaceholderSprites();
  }

  // Try loading a real image to override a placeholder sprite
  // candidates: array of relative file paths under hebrew_vampire_survivors_package/
  // meta: object with frameCount/frameCols/frameRows (and optional sizes)
  attemptOverride(id, candidates, meta = null) {
    const base = "hebrew_vampire_survivors_package/";
    for (const rel of candidates) {
      try {
        if (meta)
          this.spriteMeta.set(id, {
            ...(this.spriteMeta.get(id) || {}),
            ...meta,
          });
        this.loadSpriteOverride(id, base + rel).then(() => {
          // If successful, stop trying others
        });
        // Fire-and-forget; if it fails, next candidate may succeed
      } catch (e) {
        // continue to next candidate
      }
    }
  }

  async generatePlaceholderSprites() {
    const assets = getAssets();

    // Generate character sprites
    await this.generateCharacterSprites();

    // Generate enemy sprites
    await this.generateEnemySprites();

    // Generate weapon sprites
    await this.generateWeaponSprites();

    // Generate item sprites
    await this.generateItemSprites();

    // Generate UI sprites
    await this.generateUISprites();

    // Generate background sprites
    await this.generateBackgroundSprites();

    console.log("All placeholder sprites generated");
  }

  generateCharacterSprites() {
    const characters = getCharacters();
    const frameSize = 32;
    const frames = 4; // Walk animation frames

    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];

      // Generate character sprite
      const sprite = this.createCharacterSprite(frameSize, frames, i);
      this.sprites.set(`character_${character.id}`, sprite);
      this.spriteMeta.set(`character_${character.id}`, { frameCount: 4 });

      // Generate portrait
      const portrait = this.createCharacterPortrait(64, i);
      this.sprites.set(`portrait_${character.id}`, portrait);

      // Attempt to override with external character spritesheet if present
      const charId = character.id;
      const cid = `character_${charId}`;
      this.attemptOverride(
        cid,
        [
          `sprites/characters/${charId}.png`,
          `sprites/${charId}.png`,
          charId === "sruLik" ? "sprites/srulik.png" : null,
        ].filter(Boolean),
        { frameCount: 4, frameCols: 4, frameRows: 1 }
      );
    }
  }

  createCharacterSprite(size, frames, characterIndex) {
    this.placeholderCanvas.width = size * frames;
    this.placeholderCanvas.height = size;
    const ctx = this.placeholderContext;

    // Character color scheme based on index
    const colors = this.getCharacterColors(characterIndex);

    for (let frame = 0; frame < frames; frame++) {
      const x = frame * size;

      // Clear frame
      ctx.clearRect(x, 0, size, size);

      // Body (shirt)
      ctx.fillStyle = colors.shirt;
      ctx.fillRect(x + 8, 12, 16, 12);

      // Head
      ctx.fillStyle = colors.skin;
      ctx.fillRect(x + 10, 4, 12, 10);

      // Hair
      ctx.fillStyle = colors.hair;
      ctx.fillRect(x + 9, 3, 14, 6);

      // Eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(x + 12, 7, 2, 2);
      ctx.fillRect(x + 18, 7, 2, 2);

      // Pants
      ctx.fillStyle = colors.pants;
      ctx.fillRect(x + 10, 24, 6, 8);
      ctx.fillRect(x + 18, 24, 6, 8);

      // Simple walk animation - leg offset
      if (frame % 2 === 1) {
        ctx.clearRect(x + 10, 24, 6, 8);
        ctx.clearRect(x + 18, 24, 6, 8);
        ctx.fillRect(x + 11, 24, 6, 8);
        ctx.fillRect(x + 17, 24, 6, 8);
      }

      // Add some comedic Hebrew elements
      if (characterIndex === 0) {
        // Srulik gets special treatment
        // Add falafel in hand
        ctx.fillStyle = "#8B4513";
        ctx.fillRect(x + 4, 14, 3, 3);
        ctx.fillStyle = "#228B22";
        ctx.fillRect(x + 4, 13, 3, 2);
      }
    }

    return this.placeholderCanvas.toDataURL();
  }

  createCharacterPortrait(size, characterIndex) {
    this.placeholderCanvas.width = size;
    this.placeholderCanvas.height = size;
    const ctx = this.placeholderContext;

    ctx.clearRect(0, 0, size, size);

    const colors = this.getCharacterColors(characterIndex);

    // Background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, size, size);

    // Head (larger for portrait)
    ctx.fillStyle = colors.skin;
    ctx.fillRect(16, 12, 32, 28);

    // Hair
    ctx.fillStyle = colors.hair;
    ctx.fillRect(14, 8, 36, 20);

    // Eyes
    ctx.fillStyle = "#000";
    ctx.fillRect(22, 20, 6, 6);
    ctx.fillRect(36, 20, 6, 6);

    // Smile
    ctx.fillStyle = "#000";
    ctx.fillRect(28, 30, 8, 2);

    // Shirt collar
    ctx.fillStyle = colors.shirt;
    ctx.fillRect(20, 48, 24, 16);

    return this.placeholderCanvas.toDataURL();
  }

  getCharacterColors(index) {
    const colorSchemes = [
      {
        // Srulik - Israeli colors
        skin: "#FDBCB4",
        hair: "#8B4513",
        shirt: "#0038b8",
        pants: "#ffffff",
      },
      {
        skin: "#F5DEB3",
        hair: "#000000",
        shirt: "#ff6b6b",
        pants: "#4ecdc4",
      },
      {
        skin: "#DEB887",
        hair: "#654321",
        shirt: "#45B7D1",
        pants: "#2D3436",
      },
    ];

    return colorSchemes[index % colorSchemes.length];
  }

  generateEnemySprites() {
    const stages = getStages();
    let enemyIndex = 0;

    for (const stage of stages) {
      const allEnemies = [
        ...(stage.enemies_common || []),
        ...(stage.minibosses || []),
        ...(stage.bosses || []),
      ];

      for (const enemy of allEnemies) {
        const sprite = this.createEnemySprite(32, 4, enemyIndex, enemy.name_he);
        this.sprites.set(`enemy_${enemy.id}`, sprite);
        this.spriteMeta.set(`enemy_${enemy.id}`, { frameCount: 4 });

        // Attempt override with 4x1 sprites if present
        const eid = `enemy_${enemy.id}`;
        this.attemptOverride(
          eid,
          [`sprites/${enemy.id}.png`, `sprites/enemies/${enemy.id}.png`],
          { frameCount: 4, frameCols: 4, frameRows: 1 }
        );
        enemyIndex++;
      }
    }
  }

  createEnemySprite(size, frames, enemyIndex, nameHe) {
    this.placeholderCanvas.width = size * frames;
    this.placeholderCanvas.height = size;
    const ctx = this.placeholderContext;

    const colors = this.getEnemyColors(enemyIndex, nameHe);

    for (let frame = 0; frame < frames; frame++) {
      const x = frame * size;

      ctx.clearRect(x, 0, size, size);

      // Enemy body shape varies by type
      if (nameHe.includes("חתול")) {
        // Cat
        this.drawCat(ctx, x, colors);
      } else if (nameHe.includes("טיקטוק")) {
        // TikTok star
        this.drawTikToker(ctx, x, colors);
      } else if (nameHe.includes("קורקינט")) {
        // Scooter
        this.drawScooter(ctx, x, colors);
      } else if (nameHe.includes("תייר")) {
        // Tourist
        this.drawTourist(ctx, x, colors);
      } else {
        this.drawGenericEnemy(ctx, x, colors, frame);
      }
    }

    return this.placeholderCanvas.toDataURL();
  }

  drawCat(ctx, x, colors) {
    // Cat body
    ctx.fillStyle = colors.body;
    ctx.fillRect(x + 6, 16, 20, 12);

    // Cat head
    ctx.fillRect(x + 8, 8, 16, 12);

    // Cat ears
    ctx.fillRect(x + 10, 6, 4, 4);
    ctx.fillRect(x + 18, 6, 4, 4);

    // Eyes
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(x + 12, 10, 2, 2);
    ctx.fillRect(x + 18, 10, 2, 2);

    // Tail
    ctx.fillStyle = colors.body;
    ctx.fillRect(x + 24, 14, 6, 3);
  }

  drawTikToker(ctx, x, colors) {
    // Person with phone
    ctx.fillStyle = colors.skin;
    ctx.fillRect(x + 10, 6, 12, 10);

    // Hair (trendy)
    ctx.fillStyle = colors.hair;
    ctx.fillRect(x + 8, 4, 16, 8);

    // Body
    ctx.fillStyle = colors.shirt;
    ctx.fillRect(x + 8, 16, 16, 12);

    // Phone
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 4, 12, 6, 10);

    // Screen
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(x + 5, 13, 4, 8);
  }

  drawScooter(ctx, x, colors) {
    // Scooter platform
    ctx.fillStyle = colors.body;
    ctx.fillRect(x + 4, 20, 24, 4);

    // Handle
    ctx.fillRect(x + 12, 8, 2, 12);
    ctx.fillRect(x + 8, 8, 8, 2);

    // Wheels
    ctx.fillStyle = "#333";
    ctx.fillRect(x + 2, 22, 6, 6);
    ctx.fillRect(x + 24, 22, 6, 6);
  }

  drawTourist(ctx, x, colors) {
    // Tourist with camera and hat
    ctx.fillStyle = colors.skin;
    ctx.fillRect(x + 10, 8, 12, 10);

    // Hat
    ctx.fillStyle = colors.hat;
    ctx.fillRect(x + 8, 6, 16, 4);

    // Body
    ctx.fillStyle = colors.shirt;
    ctx.fillRect(x + 8, 18, 16, 10);

    // Camera
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 4, 14, 6, 4);

    // Camera lens
    ctx.fillStyle = "#333";
    ctx.fillRect(x + 5, 15, 4, 2);
  }

  drawGenericEnemy(ctx, x, colors, frame) {
    // Generic humanoid enemy
    ctx.fillStyle = colors.skin;
    ctx.fillRect(x + 10, 6, 12, 10);

    // Hair
    ctx.fillStyle = colors.hair;
    ctx.fillRect(x + 9, 5, 14, 6);

    // Body
    ctx.fillStyle = colors.shirt;
    ctx.fillRect(x + 8, 16, 16, 12);

    // Simple animation
    if (frame % 2 === 1) {
      ctx.fillRect(x + 6, 26, 6, 6); // Left leg
      ctx.fillRect(x + 20, 26, 6, 6); // Right leg
    } else {
      ctx.fillRect(x + 8, 26, 6, 6);
      ctx.fillRect(x + 18, 26, 6, 6);
    }
  }

  getEnemyColors(index, nameHe) {
    if (nameHe.includes("חתול")) {
      return { body: "#FF7F50", skin: "#FF7F50" };
    } else if (nameHe.includes("טיקטוק")) {
      return {
        skin: "#FDBCB4",
        hair: "#ff1493",
        shirt: "#00ff00",
      };
    } else if (nameHe.includes("קורקינט")) {
      return { body: "#87CEEB" };
    } else if (nameHe.includes("תייר")) {
      return {
        skin: "#FDBCB4",
        hat: "#8B4513",
        shirt: "#FFD700",
      };
    }

    // Default colors
    const colors = [
      { skin: "#FDBCB4", hair: "#000", shirt: "#ff4757" },
      { skin: "#F5DEB3", hair: "#654321", shirt: "#5352ed" },
      { skin: "#DEB887", hair: "#8B4513", shirt: "#ff6348" },
    ];

    return colors[index % colors.length];
  }

  generateWeaponSprites() {
    const weapons = getWeapons();
    let weaponIndex = 0;

    for (const [weaponId, weapon] of Object.entries(weapons)) {
      const sprite = this.createWeaponSprite(
        32,
        2,
        weaponIndex,
        weapon.name_he
      );
      this.sprites.set(`weapon_${weaponId}`, sprite);
      this.spriteMeta.set(`weapon_${weaponId}`, {
        frameCount: 2,
        frameCols: 2,
        frameRows: 1,
      });

      // Attempt override from disk if available
      this.attemptOverride(
        `weapon_${weaponId}`,
        [`sprites/weapons/${weaponId}.png`, `sprites/${weaponId}.png`],
        { frameCount: 2, frameCols: 2, frameRows: 1 }
      );
      weaponIndex++;
    }
  }

  createWeaponSprite(size, frames, weaponIndex, nameHe) {
    this.placeholderCanvas.width = size * frames;
    this.placeholderCanvas.height = size;
    const ctx = this.placeholderContext;

    for (let frame = 0; frame < frames; frame++) {
      const x = frame * size;
      ctx.clearRect(x, 0, size, size);

      if (nameHe.includes("צבר")) {
        // Cactus fruit
        this.drawCactusFruit(ctx, x, frame);
      } else if (nameHe.includes("כסאות")) {
        // Chairs
        this.drawChair(ctx, x, frame);
      } else if (nameHe.includes("כפרות")) {
        // Chickens
        this.drawChicken(ctx, x, frame);
      } else if (nameHe.includes("פיתות")) {
        // Pita bread
        this.drawPita(ctx, x, frame);
      } else if (nameHe.includes("מגן דוד")) {
        // Star of David
        this.drawStarOfDavid(ctx, x, frame);
      } else {
        this.drawGenericWeapon(ctx, x, frame, weaponIndex);
      }
    }

    return this.placeholderCanvas.toDataURL();
  }

  drawCactusFruit(ctx, x, frame) {
    // Prickly pear cactus fruit
    ctx.fillStyle = "#ff6b6b";
    ctx.fillRect(x + 12, 8, 8, 12);

    // Spikes
    ctx.fillStyle = "#2d3436";
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(x + 10 + i * 2, 6 + i, 1, 3);
    }

    // Animation: rotate slightly
    if (frame === 1) {
      ctx.translate(x + 16, 16);
      ctx.rotate(0.2);
      ctx.translate(-16, -16);
    }
  }

  drawChair(ctx, x, frame) {
    // White plastic chair
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;

    // Chair back
    ctx.fillRect(x + 8, 6, 16, 12);
    ctx.strokeRect(x + 8, 6, 16, 12);

    // Chair seat
    ctx.fillRect(x + 8, 16, 16, 4);
    ctx.strokeRect(x + 8, 16, 16, 4);

    // Legs
    ctx.fillRect(x + 10, 20, 2, 8);
    ctx.fillRect(x + 20, 20, 2, 8);
  }

  drawChicken(ctx, x, frame) {
    // Chicken for Kapparot
    ctx.fillStyle = "#ffffff";

    // Body
    ctx.fillRect(x + 8, 12, 16, 12);

    // Head
    ctx.fillRect(x + 6, 8, 8, 8);

    // Beak
    ctx.fillStyle = "#ffa502";
    ctx.fillRect(x + 4, 10, 3, 2);

    // Comb
    ctx.fillStyle = "#ff3742";
    ctx.fillRect(x + 8, 6, 6, 3);

    // Wing animation
    if (frame === 1) {
      ctx.fillStyle = "#f1f2f6";
      ctx.fillRect(x + 12, 14, 8, 6);
    }
  }

  drawPita(ctx, x, frame) {
    // Pita bread
    ctx.fillStyle = "#deb887";

    // Circular pita
    ctx.beginPath();
    ctx.arc(x + 16, 16, 10, 0, Math.PI * 2);
    ctx.fill();

    // Pocket opening
    ctx.fillStyle = "#8b7355";
    ctx.fillRect(x + 12, 12, 8, 2);

    // Animation: slight rotation
    if (frame === 1) {
      ctx.translate(x + 16, 16);
      ctx.rotate(0.3);
      ctx.translate(-16, -16);
    }
  }

  drawStarOfDavid(ctx, x, frame) {
    // Star of David
    ctx.fillStyle = "#0038b8";

    // Two triangles forming star
    ctx.beginPath();
    ctx.moveTo(x + 16, 6);
    ctx.lineTo(x + 22, 18);
    ctx.lineTo(x + 10, 18);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 16, 26);
    ctx.lineTo(x + 10, 14);
    ctx.lineTo(x + 22, 14);
    ctx.closePath();
    ctx.fill();
  }

  drawGenericWeapon(ctx, x, frame, weaponIndex) {
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4"];
    ctx.fillStyle = colors[weaponIndex % colors.length];

    // Generic weapon shape
    ctx.fillRect(x + 12, 8, 4, 16);
    ctx.fillRect(x + 8, 12, 12, 4);
  }

  generateItemSprites() {
    const pickups = getPickups();
    let itemIndex = 0;

    for (const [itemId, pickup] of Object.entries(pickups)) {
      const sprite = this.createItemSprite(32, itemIndex, pickup.name_he);
      this.sprites.set(`item_${itemId}`, sprite);
      itemIndex++;
    }
  }

  createItemSprite(size, itemIndex, nameHe) {
    this.placeholderCanvas.width = size;
    this.placeholderCanvas.height = size;
    const ctx = this.placeholderContext;

    ctx.clearRect(0, 0, size, size);

    if (nameHe.includes("חמין")) {
      // Cholent
      this.drawCholent(ctx);
    } else if (nameHe.includes("בוחטה")) {
      // Money bag
      this.drawMoneyBag(ctx);
    } else if (nameHe.includes('שק"מ')) {
      // Candy
      this.drawCandy(ctx);
    } else {
      this.drawGenericItem(ctx, itemIndex);
    }

    return this.placeholderCanvas.toDataURL();
  }

  drawCholent(ctx) {
    // Bowl of cholent
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(6, 16, 20, 12);

    // Stew contents
    ctx.fillStyle = "#654321";
    ctx.fillRect(8, 18, 16, 6);

    // Beans
    ctx.fillStyle = "#d2691e";
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(10 + (i % 3) * 4, 19 + Math.floor(i / 3) * 2, 2, 2);
    }
  }

  drawMoneyBag(ctx) {
    // Money bag
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(8, 12, 16, 14);

    // Bag tie
    ctx.fillStyle = "#654321";
    ctx.fillRect(14, 8, 4, 6);

    // Dollar sign
    ctx.fillStyle = "#ffd700";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("₪", 16, 22);
  }

  drawCandy(ctx) {
    // Israeli candy
    ctx.fillStyle = "#ff6b6b";
    ctx.fillRect(10, 12, 12, 8);

    // Wrapper ends
    ctx.fillStyle = "#ff3742";
    ctx.fillRect(8, 14, 4, 4);
    ctx.fillRect(20, 14, 4, 4);

    // Candy pattern
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(12, 14, 2, 4);
    ctx.fillRect(18, 14, 2, 4);
  }

  drawGenericItem(ctx, itemIndex) {
    const colors = ["#ffd700", "#ff6b6b", "#4ecdc4", "#45b7d1"];

    ctx.fillStyle = colors[itemIndex % colors.length];
    ctx.beginPath();
    ctx.arc(16, 16, 8, 0, Math.PI * 2);
    ctx.fill();

    // Inner detail
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(16, 16, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  generateUISprites() {
    // Generate UI elements
    this.sprites.set("button_normal", this.createButtonSprite("normal"));
    this.sprites.set("button_hover", this.createButtonSprite("hover"));
    this.sprites.set("button_pressed", this.createButtonSprite("pressed"));
    this.sprites.set("health_bar_bg", this.createBarSprite("#333333"));
    this.sprites.set("health_bar_fill", this.createBarSprite("#e74c3c"));
    this.sprites.set("xp_bar_bg", this.createBarSprite("#333333"));
    this.sprites.set("xp_bar_fill", this.createBarSprite("#3498db"));
  }

  createButtonSprite(state) {
    this.placeholderCanvas.width = 100;
    this.placeholderCanvas.height = 32;
    const ctx = this.placeholderContext;

    ctx.clearRect(0, 0, 100, 32);

    let color = "#4a90e2";
    if (state === "hover") color = "#5ba0f2";
    if (state === "pressed") color = "#357abd";

    // Button background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 100, 32);

    // Border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 100, 32);

    return this.placeholderCanvas.toDataURL();
  }

  createBarSprite(color) {
    this.placeholderCanvas.width = 200;
    this.placeholderCanvas.height = 20;
    const ctx = this.placeholderContext;

    ctx.clearRect(0, 0, 200, 20);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 200, 20);

    return this.placeholderCanvas.toDataURL();
  }

  generateBackgroundSprites() {
    // Generate background tiles
    this.sprites.set("bg_tel_aviv", this.createTelAvivBackground());
    this.sprites.set("bg_jerusalem", this.createJerusalemBackground());
    this.sprites.set("bg_menu", this.createMenuBackground());
  }

  createTelAvivBackground() {
    this.placeholderCanvas.width = 256;
    this.placeholderCanvas.height = 256;
    const ctx = this.placeholderContext;

    // Tel Aviv street scene
    ctx.fillStyle = "#87CEEB"; // Sky blue
    ctx.fillRect(0, 0, 256, 100);

    // Buildings
    const buildingColors = ["#f0f0f0", "#e0e0e0", "#d0d0d0"];
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = buildingColors[i % buildingColors.length];
      const height = 80 + Math.random() * 60;
      ctx.fillRect(i * 32, 100, 32, height);

      // Windows
      ctx.fillStyle = "#87CEEB";
      for (let y = 110; y < height + 100; y += 15) {
        for (let x = i * 32 + 5; x < (i + 1) * 32 - 5; x += 10) {
          ctx.fillRect(x, y, 6, 8);
        }
      }
    }

    // Street
    ctx.fillStyle = "#696969";
    ctx.fillRect(0, 180, 256, 76);

    // Bike lanes
    ctx.fillStyle = "#ff6b6b";
    ctx.fillRect(0, 190, 256, 20);

    return this.placeholderCanvas.toDataURL();
  }

  createJerusalemBackground() {
    this.placeholderCanvas.width = 256;
    this.placeholderCanvas.height = 256;
    const ctx = this.placeholderContext;

    // Jerusalem stone background
    ctx.fillStyle = "#F5DEB3"; // Beige stone
    ctx.fillRect(0, 0, 256, 256);

    // Stone blocks pattern
    ctx.strokeStyle = "#D2B48C";
    ctx.lineWidth = 1;
    for (let y = 0; y < 256; y += 20) {
      for (let x = 0; x < 256; x += 30) {
        ctx.strokeRect(x, y, 30, 20);
      }
    }

    // Arches
    ctx.fillStyle = "#8B7355";
    for (let i = 0; i < 3; i++) {
      const x = 60 + i * 70;
      ctx.beginPath();
      ctx.arc(x, 150, 25, 0, Math.PI, true);
      ctx.fill();
    }

    return this.placeholderCanvas.toDataURL();
  }

  createMenuBackground() {
    this.placeholderCanvas.width = 256;
    this.placeholderCanvas.height = 256;
    const ctx = this.placeholderContext;

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#16213e");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // Add some stars
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.fillRect(x, y, 1, 1);
    }

    return this.placeholderCanvas.toDataURL();
  }

  // Sprite loading and management
  async loadSprite(id, path) {
    if (this.sprites.has(id)) {
      return this.sprites.get(id);
    }

    if (this.loadPromises.has(id)) {
      return this.loadPromises.get(id);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprites.set(id, img);
        // Auto-detect frame layout when not specified
        const meta = this.spriteMeta.get(id) || {};
        const hintFrames = Number(meta.hintFrames) || 0;
        const setMeta = (m) =>
          this.spriteMeta.set(id, { ...(meta || {}), ...m });

        if (
          !meta.frameWidth ||
          !meta.frameHeight ||
          !meta.frameCount ||
          meta.frameCount === "auto"
        ) {
          // Case 1: horizontal strip of square frames
          if (img.width % img.height === 0 && img.width > img.height) {
            const cols = img.width / img.height;
            setMeta({
              frameCount: cols,
              frameCols: cols,
              frameRows: 1,
              frameWidth: img.height,
              frameHeight: img.height,
            });
            // Case 2: vertical strip of square frames
          } else if (img.height % img.width === 0 && img.height > img.width) {
            const rows = img.height / img.width;
            setMeta({
              frameCount: rows,
              frameCols: 1,
              frameRows: rows,
              frameWidth: img.width,
              frameHeight: img.width,
            });
            // Case 3: square spritesheet - try NxN grid using hints (e.g., 4 → 2x2)
          } else if (img.width === img.height && hintFrames >= 1) {
            const n = Math.round(Math.sqrt(hintFrames));
            if (n > 0) {
              const cols = n;
              const rows = Math.ceil(hintFrames / cols);
              setMeta({
                frameCount: hintFrames,
                frameCols: cols,
                frameRows: rows,
                frameWidth: Math.floor(img.width / cols),
                frameHeight: Math.floor(img.height / rows),
              });
            } else {
              setMeta({
                frameCount: 1,
                frameCols: 1,
                frameRows: 1,
                frameWidth: img.width,
                frameHeight: img.height,
              });
            }
          } else {
            // Fallback: single frame
            setMeta({
              frameCount: 1,
              frameCols: 1,
              frameRows: 1,
              frameWidth: img.width,
              frameHeight: img.height,
            });
          }
        }
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load sprite: ${path}`);
        // Use placeholder instead
        const placeholder = this.sprites.get(id);
        if (placeholder) {
          resolve(placeholder);
        } else {
          reject(new Error(`Sprite not found: ${id}`));
        }
      };
      img.src = path;
    });

    this.loadPromises.set(id, promise);
    return promise;
  }

  // Force-load and override an existing sprite id with an external image
  async loadSpriteOverride(id, path) {
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprites.set(id, img);
        // Re-run meta inference like in loadSprite
        const meta = this.spriteMeta.get(id) || {};
        const hintFrames = Number(meta.hintFrames) || 0;
        const setMeta = (m) =>
          this.spriteMeta.set(id, { ...(meta || {}), ...m });

        if (
          !meta.frameWidth ||
          !meta.frameHeight ||
          !meta.frameCount ||
          meta.frameCount === "auto"
        ) {
          if (img.width % img.height === 0 && img.width > img.height) {
            const cols = img.width / img.height;
            setMeta({
              frameCount: cols,
              frameCols: cols,
              frameRows: 1,
              frameWidth: img.height,
              frameHeight: img.height,
            });
          } else if (img.height % img.width === 0 && img.height > img.width) {
            const rows = img.height / img.width;
            setMeta({
              frameCount: rows,
              frameCols: 1,
              frameRows: rows,
              frameWidth: img.width,
              frameHeight: img.width,
            });
          } else if (img.width === img.height && hintFrames >= 1) {
            const n = Math.round(Math.sqrt(hintFrames));
            if (n > 0) {
              const cols = n;
              const rows = Math.ceil(hintFrames / cols);
              setMeta({
                frameCount: hintFrames,
                frameCols: cols,
                frameRows: rows,
                frameWidth: Math.floor(img.width / cols),
                frameHeight: Math.floor(img.height / rows),
              });
            } else {
              setMeta({
                frameCount: 1,
                frameCols: 1,
                frameRows: 1,
                frameWidth: img.width,
                frameHeight: img.height,
              });
            }
          } else {
            setMeta({
              frameCount: 1,
              frameCols: 1,
              frameRows: 1,
              frameWidth: img.width,
              frameHeight: img.height,
            });
          }
        }
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to override sprite: ${path}`);
        reject(new Error(`Sprite override failed: ${id}`));
      };
      img.src = path;
    });

    this.loadPromises.set(id, promise);
    return promise;
  }

  getSprite(id) {
    return this.sprites.get(id);
  }

  getSpriteDataURL(id) {
    const sprite = this.sprites.get(id);
    if (typeof sprite === "string") {
      return sprite; // Already a data URL
    }
    return null;
  }

  // Draw sprite on canvas
  drawSprite(ctx, spriteId, x, y, width = null, height = null, frame = 0) {
    const sprite = this.getSprite(spriteId);
    if (!sprite) return;

    if (typeof sprite === "string") {
      // Convert data URL to a cached Image once
      let img = this.imageCache.get(spriteId);
      if (!img) {
        img = new Image();
        img.onload = () => {
          // Replace the string with the Image for future fast draws
          this.sprites.set(spriteId, img);
          this.imageCache.set(spriteId, img);
        };
        img.src = sprite;
        this.imageCache.set(spriteId, img);
      }
      if (img.complete && img.naturalWidth) {
        this.drawSpriteImage(ctx, spriteId, img, x, y, width, height, frame);
      }
      return;
    }

    this.drawSpriteImage(ctx, spriteId, sprite, x, y, width, height, frame);
  }

  drawSpriteImage(
    ctx,
    spriteId,
    img,
    x,
    y,
    width = null,
    height = null,
    frame = 0
  ) {
    const meta = this.spriteMeta.get(spriteId) || {};
    let frameCount = Number(meta.frameCount) || 1;
    const frameCols = Number(meta.frameCols) || frameCount;
    const frameRows = Number(meta.frameRows) || 1;
    const frameWidth =
      Number(meta.frameWidth) || Math.floor(img.width / frameCols);
    const frameHeight =
      Number(meta.frameHeight) || Math.floor(img.height / frameRows);

    const useFrame = frameCount === 1 ? 0 : frame % frameCount;
    const col = frameCols > 0 ? useFrame % frameCols : 0;
    const row = frameCols > 0 ? Math.floor(useFrame / frameCols) : 0;
    const sourceX = col * frameWidth;
    const sourceY = row * frameHeight;

    const destWidth = width || frameWidth;
    const destHeight = height || frameHeight;

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      frameWidth,
      frameHeight,
      x,
      y,
      destWidth,
      destHeight
    );
  }

  // Animation management
  createAnimatedSprite(spriteId, frameCount, frameDuration) {
    return {
      spriteId,
      frameCount,
      frameDuration,
      currentFrame: 0,
      timeAccumulator: 0,

      update(deltaTime) {
        this.timeAccumulator += deltaTime;
        if (this.timeAccumulator >= this.frameDuration) {
          this.currentFrame = (this.currentFrame + 1) % this.frameCount;
          this.timeAccumulator = 0;
        }
      },

      draw(ctx, x, y, width, height) {
        spriteManager.drawSprite(
          ctx,
          this.spriteId,
          x,
          y,
          width,
          height,
          this.currentFrame
        );
      },
    };
  }
}

// Create sprite manager instance
const spriteManager = new SpriteManager();

// Export sprite manager
window.SpriteManager = SpriteManager;
window.spriteManager = spriteManager;

// Lightweight frame animator used by entities and projectiles
class FrameAnimator {
  constructor() {
    this.frames = [0];
    this.fps = 8; // default
    this.timeAccumulator = 0;
    this.currentIndex = 0;
    this._lastAppliedKey = null;
  }

  setSequence(frames, fps = 8, key = null) {
    // Avoid resetting if sequence unchanged
    const sameKey = key && this._lastAppliedKey === key;
    const sameFrames =
      this.frames.length === frames.length &&
      this.frames.every((v, i) => v === frames[i]);
    if (sameKey || sameFrames) {
      this.fps = fps;
      return;
    }
    this.frames = frames.slice();
    this.fps = fps;
    this.timeAccumulator = 0;
    this.currentIndex = 0;
    this._lastAppliedKey = key || null;
  }

  update(deltaTime) {
    if (!this.frames || this.frames.length <= 1) return;
    this.timeAccumulator += deltaTime;
    const frameDuration = 1 / Math.max(1, this.fps);
    while (this.timeAccumulator >= frameDuration) {
      this.timeAccumulator -= frameDuration;
      this.currentIndex = (this.currentIndex + 1) % this.frames.length;
    }
  }

  getFrame() {
    if (!this.frames || this.frames.length === 0) return 0;
    return this.frames[this.currentIndex] || 0;
  }
}

window.FrameAnimator = FrameAnimator;
