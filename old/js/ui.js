// Dynamic UI system that reads from JSON configuration

class UIManager {
  constructor() {
    this.overlay = document.getElementById("uiOverlay");
    this.elements = new Map();
    this.currentScreen = null;
    this.screenTransition = null;
    this.callbacks = new Map();

    this.createScreenTransition();
  }

  createScreenTransition() {
    this.screenTransition = document.createElement("div");
    this.screenTransition.className = "screen-transition";
    document.body.appendChild(this.screenTransition);
  }

  async loadScreen(screenId, data = {}) {
    const layout = getUILayout();
    const screen = layout.screens?.[screenId];

    if (!screen) {
      console.error("Screen not found:", screenId);
      return;
    }

    // Transition out
    await this.transitionOut();

    // Clear current screen
    this.clearScreen();

    // Create new screen
    this.currentScreen = screenId;
    await this.createScreen(screen, data);

    // Transition in
    await this.transitionIn();

    // Screen loaded
  }

  async createScreen(screen, data) {
    // Set background if specified
    if (screen.background) {
      this.setBackground(screen.background);
    }

    // Create UI elements
    if (screen.elements) {
      for (const element of screen.elements) {
        await this.createElement(element, data);
      }
    }

    // Setup navigation
    if (screen.navigation) {
      this.setupNavigation(screen.navigation);
    }

    // Setup special handlers
    if (screen.on_select_character) {
      this.setupCharacterSelection(screen.on_select_character);
    }

    if (screen.on_select_stage) {
      this.setupStageSelection(screen.on_select_stage);
    }

    if (screen.on_click) {
      this.setupScreenClick(screen.on_click);
    }
  }

  async createElement(element, data) {
    const div = document.createElement("div");
    div.className = "ui-element";
    div.id = element.id;

    // Position and size
    this.applyElementTransform(div, element);

    // Create element based on type
    switch (element.type) {
      case "label":
        this.createLabel(div, element, data);
        break;
      case "button":
        this.createButton(div, element, data);
        break;
      case "grid":
        await this.createGrid(div, element, data);
        break;
      case "carousel":
        await this.createCarousel(div, element, data);
        break;
      case "list":
        await this.createList(div, element, data);
        break;
      case "slider":
        this.createSlider(div, element, data);
        break;
      case "toggle":
        this.createToggle(div, element, data);
        break;
    }

    // Add to overlay
    this.overlay.appendChild(div);
    this.elements.set(element.id, div);

    // Apply special effects
    if (element.blink) {
      div.classList.add("blink");
    }

    // Show/hide based on conditions
    if (element.desktop_only && this.isMobile()) {
      div.style.display = "none";
    }

    return div;
  }

  applyElementTransform(div, element) {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;

    // Calculate position
    const pos = UIUtils.relativeToScreen(
      element.x || 0,
      element.y || 0,
      containerWidth,
      containerHeight
    );

    // Calculate size
    const width = element.w ? element.w * containerWidth : "auto";
    const height = element.h ? element.h * containerHeight : "auto";

    // Apply anchor offset
    const anchor = element.anchor || "center";
    const offset = UIUtils.getAnchorOffset(
      anchor,
      typeof width === "number" ? width : 0,
      typeof height === "number" ? height : 0
    );

    // Set styles
    div.style.position = "absolute";
    div.style.left = `${pos.x + offset.x}px`;
    div.style.top = `${pos.y + offset.y}px`;

    if (typeof width === "number") {
      div.style.width = `${width}px`;
    }
    if (typeof height === "number") {
      div.style.height = `${height}px`;
    }

    // Font size
    if (element.font_size) {
      div.style.fontSize = `${
        element.font_size * (window.innerWidth / 1280)
      }px`;
    }
  }

  createLabel(div, element, data) {
    div.className += " ui-label";

    let text = this.getElementText(element, data);
    div.textContent = text;

    // Bind dynamic values
    if (element.bind_value) {
      this.setupValueBinding(div, element.bind_value, data);
    }
  }

  createButton(div, element, data) {
    div.className += " ui-button";
    div.tabIndex = 0; // Make focusable

    let text = this.getElementText(element, data);
    div.textContent = text;

    // Add hover and click effects
    div.addEventListener("mouseenter", () => {
      div.style.transform = "translateY(-2px)";
    });

    div.addEventListener("mouseleave", () => {
      div.style.transform = "translateY(0)";
    });

    // Store callback for navigation setup
    this.callbacks.set(element.id, () => {
      if (element.onClick) {
        element.onClick();
      }
    });
  }

  async createGrid(div, element, data) {
    div.className += " ui-grid";

    const cols = element.cols || 3;
    const rows = element.rows || 2;

    div.style.display = "grid";
    div.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    div.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    div.style.gap = "10px";

    // Bind data
    if (element.bind === "characters") {
      await this.createCharacterGrid(div, data);
    }
  }

  async createCharacterGrid(div, data) {
    const characters = getCharacters();

    for (const character of characters) {
      const card = document.createElement("div");
      card.className = "character-card";
      card.setAttribute("data-character-id", character.id);

      // Character portrait
      const portrait = document.createElement("div");
      portrait.className = "character-portrait";
      portrait.style.background = "#333";
      portrait.style.display = "flex";
      portrait.style.alignItems = "center";
      portrait.style.justifyContent = "center";
      portrait.style.height = "96px";
      portrait.style.borderRadius = "8px";
      portrait.style.overflow = "hidden";

      // Render actual character sprite (frame 0) into a canvas
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const pctx = canvas.getContext("2d");
      const spriteId = `character_${character.id}`;

      const drawPortrait = () => {
        pctx.clearRect(0, 0, canvas.width, canvas.height);
        // Center 32x32 sprite within 64x64 canvas
        if (window.spriteManager) {
          window.spriteManager.drawSprite(pctx, spriteId, 16, 16, 32, 32, 0);
        }
      };
      // Initial draw and a delayed redraw to handle async image load
      drawPortrait();
      setTimeout(drawPortrait, 120);
      portrait.appendChild(canvas);
      card.appendChild(portrait);

      // Character name
      const name = document.createElement("div");
      name.textContent = character.name_he;
      name.style.fontWeight = "bold";
      name.style.marginBottom = "5px";
      card.appendChild(name);

      // Character description
      const desc = document.createElement("div");
      desc.textContent = character.description_he;
      desc.style.fontSize = "12px";
      desc.style.opacity = "0.8";
      card.appendChild(desc);

      // Click handler
      card.addEventListener("click", () => {
        this.selectCharacter(character.id);
      });

      div.appendChild(card);
    }
  }

  async createCarousel(div, element, data) {
    div.className += " ui-carousel";

    // Bind data
    if (element.bind === "stages") {
      await this.createStageCarousel(div, data);
    }
  }

  async createStageCarousel(div, data) {
    const stages = getStages();
    const currentStageIndex = data.selectedStageIndex || 0;

    // Previous button
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "◀";
    prevBtn.className = "ui-button";
    prevBtn.style.margin = "0 20px";

    // Stage display
    const stageDisplay = document.createElement("div");
    stageDisplay.style.textAlign = "center";
    stageDisplay.style.minWidth = "300px";

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "▶";
    nextBtn.className = "ui-button";
    nextBtn.style.margin = "0 20px";

    // Update display function
    const updateDisplay = (index) => {
      const stage = stages[index];
      if (!stage) return;

      stageDisplay.innerHTML = `
                <div class="stage-card">
                    <div class="stage-preview"></div>
                    <h3>${stage.name_he}</h3>
                    <p>${stage.description_he}</p>
                </div>
            `;

      const stageCard = stageDisplay.querySelector(".stage-card");
      stageCard.addEventListener("click", () => {
        this.selectStage(stage.id);
      });
    };

    // Button handlers
    let currentIndex = currentStageIndex;
    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + stages.length) % stages.length;
      updateDisplay(currentIndex);
    });

    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % stages.length;
      updateDisplay(currentIndex);
    });

    // Initial display
    updateDisplay(currentIndex);

    div.appendChild(prevBtn);
    div.appendChild(stageDisplay);
    div.appendChild(nextBtn);
  }

  async createList(div, element, data) {
    div.className += " ui-list";

    // Bind data
    if (element.bind === "meta_shop") {
      await this.createMetaShopList(div, data);
    } else if (element.bind === "achievements") {
      await this.createAchievementsList(div, data);
    }
  }

  async createMetaShopList(div, data) {
    const shopItems = getMetaShop();
    const playerGold = data.playerGold || 0;

    for (const item of shopItems) {
      const itemDiv = document.createElement("div");
      itemDiv.className = "shop-item";

      // Check if affordable
      const cost = item.cost || 100; // Default cost
      if (playerGold >= cost) {
        itemDiv.classList.add("affordable");
      }

      itemDiv.innerHTML = `
                <div>
                    <div style="font-weight: bold;">${item.name_he}</div>
                    <div style="font-size: 12px; opacity: 0.8;">${
                      item.description_he || ""
                    }</div>
                </div>
                <div style="color: gold;">${cost} ${getText(
        "ui_strings.common.gold"
      )}</div>
            `;

      itemDiv.addEventListener("click", () => {
        this.buyShopItem(item.id, cost);
      });

      div.appendChild(itemDiv);
    }
  }

  async createAchievementsList(div, data) {
    const achievements = getAchievements();
    const unlockedAchievements = data.unlockedAchievements || [];

    for (const achievement of achievements) {
      const itemDiv = document.createElement("div");
      itemDiv.className = "achievement-item";

      if (unlockedAchievements.includes(achievement.id)) {
        itemDiv.classList.add("unlocked");
      }

      itemDiv.innerHTML = `
                <div>
                    <div style="font-weight: bold;">${achievement.name_he}</div>
                    <div style="font-size: 12px; opacity: 0.8;">${
                      achievement.description_he || ""
                    }</div>
                </div>
                <div>${
                  itemDiv.classList.contains("unlocked") ? "✓" : "🔒"
                }</div>
            `;

      div.appendChild(itemDiv);
    }
  }

  createSlider(div, element, data) {
    div.className += " ui-slider";

    const label = document.createElement("label");
    label.textContent = getText(element.label_key);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = element.min || 0;
    slider.max = element.max || 100;
    slider.value = this.getBoundValue(element.bind_value, data) || 50;

    const valueDisplay = document.createElement("span");
    valueDisplay.textContent = slider.value + "%";

    slider.addEventListener("input", () => {
      valueDisplay.textContent = slider.value + "%";
      this.setBoundValue(element.bind_value, slider.value, data);
    });

    div.appendChild(label);
    div.appendChild(slider);
    div.appendChild(valueDisplay);
  }

  createToggle(div, element, data) {
    div.className += " ui-toggle";

    const label = document.createElement("label");
    label.textContent = getText(element.label_key);

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = this.getBoundValue(element.bind_value, data) || false;

    toggle.addEventListener("change", () => {
      this.setBoundValue(element.bind_value, toggle.checked, data);
    });

    div.appendChild(label);
    div.appendChild(toggle);
  }

  getElementText(element, data) {
    if (element.text_he) {
      return element.text_he;
    }
    if (element.text_key) {
      return getText(element.text_key);
    }
    return element.text || "";
  }

  getBoundValue(bindPath, data) {
    if (!bindPath) return null;

    // Parse bind path (e.g., "player.gold", "settings.music_volume")
    const parts = bindPath.split(".");
    let value = data;

    for (const part of parts) {
      if (value && value[part] !== undefined) {
        value = value[part];
      } else {
        return null;
      }
    }

    return value;
  }

  setBoundValue(bindPath, value, data) {
    if (!bindPath) return;

    // This should update the game state
    window.dispatchEvent(
      new CustomEvent("settingChanged", {
        detail: { path: bindPath, value },
      })
    );
  }

  setupValueBinding(element, bindPath, data) {
    // Set up periodic updates for dynamic values
    const updateValue = () => {
      const value = this.getBoundValue(bindPath, data);
      if (value !== null) {
        if (bindPath.includes("gold")) {
          element.textContent = `${getText(
            "ui_strings.common.gold"
          )}: ${value}`;
        } else if (bindPath.includes("version")) {
          element.textContent = `${getText(
            "ui_strings.menu.version"
          )}: ${value}`;
        } else {
          element.textContent = value;
        }
      }
    };

    updateValue();

    // Update periodically
    const interval = setInterval(updateValue, 100);
    element.setAttribute("data-update-interval", interval);
  }

  setupNavigation(navigation) {
    for (const [elementId, action] of Object.entries(navigation)) {
      const element = this.elements.get(elementId);
      if (element) {
        element.addEventListener("click", () => {
          this.handleNavigation(action);
        });

        // Add keyboard support
        element.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.handleNavigation(action);
          }
        });
      }
    }
  }

  setupCharacterSelection(action) {
    const characterCards = this.overlay.querySelectorAll(".character-card");
    characterCards.forEach((card) => {
      card.addEventListener("click", () => {
        // Remove previous selection
        characterCards.forEach((c) => c.classList.remove("selected"));
        // Add selection to clicked card
        card.classList.add("selected");

        // Store selection and navigate
        const characterId = card.getAttribute("data-character-id");
        window.gameState.selectedCharacter = characterId;

        setTimeout(() => {
          this.handleNavigation(action);
        }, 500);
      });
    });
  }

  setupStageSelection(action) {
    // This will be handled by the carousel click events
    this.stageSelectionAction = action;
  }

  setupScreenClick(action) {
    this.overlay.addEventListener("click", (e) => {
      // Only trigger if clicking the overlay itself, not its children
      if (e.target === this.overlay) {
        this.handleNavigation(action);
      }
    });
  }

  selectCharacter(characterId) {
    if (window.gameState) {
      window.gameState.selectedCharacter = characterId;
    }

    // Navigate if character selection action is set
    if (this.currentScreen === "character_select") {
      const layout = getUILayout();
      const screen = layout.screens?.character_select;
      if (screen?.on_select_character) {
        setTimeout(() => {
          this.handleNavigation(screen.on_select_character);
        }, 500);
      }
    }
  }

  selectStage(stageId) {
    if (window.gameState) {
      window.gameState.selectedStage = stageId;
    }

    // Navigate if stage selection action is set
    if (this.stageSelectionAction) {
      this.handleNavigation(this.stageSelectionAction);
    }
  }

  buyShopItem(itemId, cost) {
    window.dispatchEvent(
      new CustomEvent("buyShopItem", {
        detail: { itemId, cost },
      })
    );
  }

  handleNavigation(action) {
    if (action.startsWith("goto:")) {
      const screenId = action.substring(5);
      window.dispatchEvent(
        new CustomEvent("navigateToScreen", {
          detail: { screenId },
        })
      );
    } else if (action === "start_game") {
      window.dispatchEvent(new CustomEvent("startGame"));
    } else {
      console.log("Unknown navigation action:", action);
    }
  }

  async transitionOut() {
    return new Promise((resolve) => {
      this.screenTransition.classList.add("active");
      setTimeout(resolve, 150);
    });
  }

  async transitionIn() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.screenTransition.classList.remove("active");
        resolve();
      }, 150);
    });
  }

  clearScreen() {
    // Clear all elements
    this.overlay.innerHTML = "";
    this.elements.clear();
    this.callbacks.clear();

    // Clear intervals
    const intervals = this.overlay.querySelectorAll("[data-update-interval]");
    intervals.forEach((element) => {
      const interval = element.getAttribute("data-update-interval");
      if (interval) {
        clearInterval(parseInt(interval));
      }
    });

    this.currentScreen = null;
  }

  setBackground(background) {
    const canvas = document.getElementById("gameCanvas");
    if (background.sprite) {
      // Set background image
      canvas.style.backgroundImage = `url('hebrew_vampire_survivors_package/${background.sprite}')`;
      canvas.style.backgroundSize = "cover";
      canvas.style.backgroundPosition = "center";
    }
  }

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  // HUD management for gameplay
  createHUD(gameState) {
    this.clearScreen();
    // Deprecated fixed health bar; now drawn under player in-world

    // XP bar
    const xpBar = document.createElement("div");
    xpBar.className = "xp-bar top";
    xpBar.innerHTML = '<div class="xp-fill"></div>';
    document.body.appendChild(xpBar);

    // Level label inside XP bar (top-right)
    const xpLevel = document.createElement("div");
    xpLevel.className = "xp-level";
    xpBar.appendChild(xpLevel);

    // Push game container down to make room for the XP bar
    const container = document.getElementById("gameContainer");
    const adjustLayout = () => {
      const h = xpBar.getBoundingClientRect().height || 16;
      if (container) {
        container.style.marginTop = `${h}px`;
        container.style.height = `calc(100vh - ${h}px)`;
      }
    };
    adjustLayout();
    window.addEventListener("resize", adjustLayout);
    this._xpAdjustHandler = adjustLayout;

    // Timer
    const timer = document.createElement("div");
    timer.className = "hud-element";
    timer.style.position = "fixed";
    timer.style.top = "24px"; // below the XP bar
    timer.style.left = "50%";
    timer.style.transform = "translateX(-50%)";
    timer.textContent = "00:00";
    document.body.appendChild(timer);

    // Gold counter
    const gold = document.createElement("div");
    gold.className = "hud-element";
    gold.style.position = "fixed";
    gold.style.top = "60px";
    gold.style.right = "20px";
    gold.textContent = `${getText("ui_strings.hud.gold")}: 0`;
    document.body.appendChild(gold);

    this.hudElements = { xpBar, xpLevel, timer, gold };
  }

  updateHUD(gameState) {
    if (!this.hudElements) return;

    const { xpBar, xpLevel, timer, gold } = this.hudElements;

    // Update XP/level/gold
    if (gameState.player) {
      // Update XP
      const xpPercent = (gameState.player.xp / gameState.player.xpToNext) * 100;
      xpBar.querySelector(".xp-fill").style.width = `${xpPercent}%`;

      // Update level label inside XP bar (with JSON label if available, fallback to "רמה")
      let levelLabel = "רמה";
      try {
        const t = getText("ui_strings.hud.level");
        if (t && !/ui_strings/.test(t)) levelLabel = t;
      } catch (e) {}
      xpLevel.textContent = `${levelLabel}: ${gameState.player.level}`;

      // Update gold
      gold.textContent = `${getText("ui_strings.hud.gold")}: ${
        gameState.player.gold
      }`;
    }

    // Update timer
    if (gameState.gameTime !== undefined) {
      timer.textContent = TimeUtils.formatTime(gameState.gameTime);
    }
  }

  clearHUD() {
    if (this.hudElements) {
      Object.values(this.hudElements).forEach((element) => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      this.hudElements = null;
    }

    // Restore container layout
    const container = document.getElementById("gameContainer");
    if (container) {
      container.style.marginTop = "0px";
      container.style.height = "100vh";
    }
    if (this._xpAdjustHandler) {
      window.removeEventListener("resize", this._xpAdjustHandler);
      this._xpAdjustHandler = null;
    }
  }

  showLevelUpPanel(options, onSelect) {
    const panel = document.createElement("div");
    panel.className = "level-up-panel";

    const title = document.createElement("h2");
    title.textContent = getText("ui_strings.level_up.title");
    panel.appendChild(title);

    const subtitle = document.createElement("p");
    subtitle.textContent = getText("ui_strings.level_up.choose_one");
    panel.appendChild(subtitle);

    const optionsContainer = document.createElement("div");
    optionsContainer.style.display = "flex";
    optionsContainer.style.justifyContent = "center";
    optionsContainer.style.flexWrap = "wrap";

    options.forEach((option) => {
      const optionDiv = document.createElement("div");
      optionDiv.className = "weapon-option";

      optionDiv.innerHTML = `
                <h3>${option.name}</h3>
                <p>${option.description}</p>
            `;

      optionDiv.addEventListener("click", () => {
        panel.remove();
        onSelect(option);
      });

      optionsContainer.appendChild(optionDiv);
    });

    panel.appendChild(optionsContainer);
    document.body.appendChild(panel);

    return panel;
  }

  showDamageNumber(x, y, damage, color = "#e74c3c") {
    const damageElement = document.createElement("div");
    damageElement.className = "damage-number";
    damageElement.textContent = Math.round(damage);
    damageElement.style.left = `${x}px`;
    damageElement.style.top = `${y}px`;
    damageElement.style.color = color;

    document.body.appendChild(damageElement);

    // Remove after animation
    setTimeout(() => {
      if (damageElement.parentNode) {
        damageElement.parentNode.removeChild(damageElement);
      }
    }, 1000);
  }
}

// Export UI manager
window.UIManager = UIManager;
