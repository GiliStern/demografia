import { UIUtils, TimeUtils } from './utils';
import { getUILayout, getText, getStages, getCharacters, getMetaShop, getAchievements } from './config';

type ScreenLayout = any;

class UIManagerTS {
  overlay: HTMLElement | null = null;
  elements: Map<string, HTMLElement> = new Map();
  currentScreen: string | null = null;
  screenTransition: HTMLDivElement | null = null;
  callbacks: Map<string, () => void> = new Map();
  hudElements: { xpBar: HTMLElement; xpLevel: HTMLElement; timer: HTMLElement; gold: HTMLElement } | null = null;
  _xpAdjustHandler: (() => void) | null = null;
  stageSelectionAction: string | null = null;

  constructor() {
    this.overlay = document.getElementById('uiOverlay');
    this.createScreenTransition();
  }

  private createScreenTransition(): void {
    this.screenTransition = document.createElement('div');
    this.screenTransition.className = 'screen-transition';
    document.body.appendChild(this.screenTransition);
  }

  async loadScreen(screenId: string, data: any = {}): Promise<void> {
    // Resolve the screen from config, with a short retry window to handle
    // any async timing between config load and first screen init.
    let layout = getUILayout();
    let screen: ScreenLayout = layout.screens?.[screenId];
    if (!screen) {
      for (let i = 0; i < 5 && !screen; i++) {
        await new Promise((r) => setTimeout(r, 100));
        layout = getUILayout();
        screen = layout.screens?.[screenId];
      }
    }
    if (!screen) { console.error('Screen not found:', screenId); return; }
    await this.transitionOut();
    this.clearScreen();
    this.currentScreen = screenId;
    await this.createScreen(screen, data);
    await this.transitionIn();
  }

  private async createScreen(screen: ScreenLayout, data: any): Promise<void> {
    if (screen.background) this.setBackground(screen.background);
    if (screen.elements) {
      for (const element of screen.elements) await this.createElement(element, data);
    }
    if (screen.navigation) this.setupNavigation(screen.navigation);
    if (screen.on_select_character) this.setupCharacterSelection(screen.on_select_character);
    if (screen.on_select_stage) this.setupStageSelection(screen.on_select_stage);
    if (screen.on_click) this.setupScreenClick(screen.on_click);
  }

  private async createElement(element: any, data: any): Promise<HTMLElement> {
    const div = document.createElement('div');
    div.className = 'ui-element';
    div.id = element.id;
    this.applyElementTransform(div, element);
    switch (element.type) {
      case 'label': this.createLabel(div, element, data); break;
      case 'button': this.createButton(div, element, data); break;
      case 'grid': await this.createGrid(div, element, data); break;
      case 'carousel': await this.createCarousel(div, element, data); break;
      case 'list': await this.createList(div, element, data); break;
      case 'slider': this.createSlider(div, element, data); break;
      case 'toggle': this.createToggle(div, element, data); break;
    }
    this.overlay?.appendChild(div);
    this.elements.set(element.id, div);
    if (element.blink) div.classList.add('blink');
    if (element.desktop_only && this.isMobile()) div.style.display = 'none';
    return div;
  }

  private applyElementTransform(div: HTMLElement, element: any): void {
    const containerEl = document.getElementById('gameContainer');
    const rect = containerEl?.getBoundingClientRect();
    const containerWidth = rect?.width || window.innerWidth;
    const containerHeight = rect?.height || window.innerHeight;
    const pos = UIUtils.relativeToScreen(element.x || 0, element.y || 0, containerWidth, containerHeight);
    const width = element.w ? element.w * containerWidth : 'auto';
    const height = element.h ? element.h * containerHeight : 'auto';
    const anchor = element.anchor || 'center';
    const offset = UIUtils.getAnchorOffset(anchor, typeof width === 'number' ? width : 0, typeof height === 'number' ? height : 0);
    div.style.position = 'absolute';
    div.style.left = `${pos.x + (rect?.left || 0) + offset.x}px`;
    div.style.top = `${pos.y + (rect?.top || 0) + offset.y}px`;
    if (typeof width === 'number') div.style.width = `${width}px`;
    if (typeof height === 'number') div.style.height = `${height}px`;
    if (element.font_size) div.style.fontSize = `${element.font_size * (window.innerWidth / 1280)}px`;
  }

  private createLabel(div: HTMLElement, element: any, data: any): void {
    div.className += ' ui-label';
    const text = this.getElementText(element, data);
    div.textContent = text;
    if (element.bind_value) this.setupValueBinding(div, element.bind_value, data);
  }

  private createButton(div: HTMLElement, element: any): void {
    div.className += ' ui-button';
    (div as any).tabIndex = 0;
    div.textContent = this.getElementText(element);
    div.addEventListener('mouseenter', () => { div.style.transform = 'translateY(-2px)'; });
    div.addEventListener('mouseleave', () => { div.style.transform = 'translateY(0)'; });
    this.callbacks.set(element.id, () => { if (element.onClick) element.onClick(); });
  }

  private async createGrid(div: HTMLElement, element: any): Promise<void> {
    div.className += ' ui-grid';
    const cols = element.cols || 3; const rows = element.rows || 2;
    div.setAttribute('style', `display:grid;grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr);gap:10px;`);
    if (element.bind === 'characters') await this.createCharacterGrid(div);
  }

  private async createCharacterGrid(div: HTMLElement): Promise<void> {
    const characters = getCharacters();
    for (const character of characters) {
      const card = document.createElement('div');
      card.className = 'character-card';
      card.setAttribute('data-character-id', character.id);
      const portrait = document.createElement('div');
      portrait.className = 'character-portrait';
      Object.assign(portrait.style, { background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '96px', borderRadius: '8px', overflow: 'hidden' });
      const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64; const pctx = canvas.getContext('2d')!; const spriteId = `character_${character.id}`;
      const drawPortrait = () => { pctx.clearRect(0, 0, canvas.width, canvas.height); if ((window as any).spriteManager) (window as any).spriteManager.drawSprite(pctx, spriteId, 16, 16, 32, 32, 0); };
      drawPortrait(); setTimeout(drawPortrait, 120);
      portrait.appendChild(canvas); card.appendChild(portrait);
      const name = document.createElement('div'); name.textContent = character.name_he; name.style.fontWeight = 'bold'; name.style.marginBottom = '5px'; card.appendChild(name);
      const desc = document.createElement('div'); desc.textContent = character.description_he; desc.style.fontSize = '12px'; desc.style.opacity = '0.8'; card.appendChild(desc);
      card.addEventListener('click', () => { this.selectCharacter(character.id); });
      div.appendChild(card);
    }
  }

  private async createCarousel(div: HTMLElement, element: any, data: any): Promise<void> {
    div.className += ' ui-carousel';
    if (element.bind === 'stages') await this.createStageCarousel(div, data);
  }

  private async createStageCarousel(div: HTMLElement, data: any): Promise<void> {
    const stages = getStages();
    let currentIndex = data.selectedStageIndex || 0;
    const prevBtn = document.createElement('button'); prevBtn.textContent = '◀'; prevBtn.className = 'ui-button'; prevBtn.style.margin = '0 20px';
    const stageDisplay = document.createElement('div'); stageDisplay.style.textAlign = 'center'; stageDisplay.style.minWidth = '300px';
    const nextBtn = document.createElement('button'); nextBtn.textContent = '▶'; nextBtn.className = 'ui-button'; nextBtn.style.margin = '0 20px';
    const updateDisplay = (index: number) => {
      const stage = stages[index]; if (!stage) return;
      stageDisplay.innerHTML = `
        <div class="stage-card">
          <div class="stage-preview"></div>
          <h3>${stage.name_he}</h3>
          <p>${stage.description_he}</p>
        </div>`;
      const stageCard = stageDisplay.querySelector('.stage-card')! as HTMLElement;
      stageCard.addEventListener('click', () => this.selectStage(stage.id));
    };
    prevBtn.addEventListener('click', () => { currentIndex = (currentIndex - 1 + stages.length) % stages.length; updateDisplay(currentIndex); });
    nextBtn.addEventListener('click', () => { currentIndex = (currentIndex + 1) % stages.length; updateDisplay(currentIndex); });
    updateDisplay(currentIndex);
    div.appendChild(prevBtn); div.appendChild(stageDisplay); div.appendChild(nextBtn);
  }

  private async createList(div: HTMLElement, element: any, data: any): Promise<void> {
    div.className += ' ui-list';
    if (element.bind === 'meta_shop') await this.createMetaShopList(div, data);
    else if (element.bind === 'achievements') await this.createAchievementsList(div, data);
  }

  private async createMetaShopList(div: HTMLElement, data: any): Promise<void> {
    const shopItems = getMetaShop();
    const playerGold = data.playerGold || 0;
    for (const item of shopItems) {
      const itemDiv = document.createElement('div'); itemDiv.className = 'shop-item';
      const cost = item.cost || 100; if (playerGold >= cost) itemDiv.classList.add('affordable');
      itemDiv.innerHTML = `
        <div>
          <div style="font-weight: bold;">${item.name_he}</div>
          <div style="font-size: 12px; opacity: 0.8;">${item.description_he || ''}</div>
        </div>
        <div style="color: gold;" data-cost="${cost}">${cost} ${getText('ui_strings.common.gold')}</div>`;
      itemDiv.addEventListener('click', () => { window.dispatchEvent(new CustomEvent('buyShopItem', { detail: { itemId: item.id, cost } })); });
      div.appendChild(itemDiv);
    }
  }

  private async createAchievementsList(div: HTMLElement, data: any): Promise<void> {
    const achievements = getAchievements();
    const unlocked = data.unlockedAchievements || [];
    for (const achievement of achievements) {
      const itemDiv = document.createElement('div'); itemDiv.className = 'achievement-item';
      if (unlocked.includes(achievement.id)) itemDiv.classList.add('unlocked');
      itemDiv.innerHTML = `
        <div>
          <div style="font-weight: bold;">${achievement.name_he}</div>
          <div style="font-size: 12px; opacity: 0.8;">${achievement.description_he || ''}</div>
        </div>
        <div>${itemDiv.classList.contains('unlocked') ? '✓' : '🔒'}</div>`;
      div.appendChild(itemDiv);
    }
  }

  private createSlider(div: HTMLElement, element: any, data: any): void {
    div.className += ' ui-slider';
    const label = document.createElement('label'); label.textContent = getText(element.label_key);
    const slider = document.createElement('input'); slider.type = 'range'; slider.min = element.min || 0; slider.max = element.max || 100; slider.value = String(this.getBoundValue(element.bind_value, data) || 50);
    const valueDisplay = document.createElement('span'); valueDisplay.textContent = `${slider.value}%`;
    slider.addEventListener('input', () => { valueDisplay.textContent = `${slider.value}%`; this.setBoundValue(element.bind_value, Number(slider.value)); });
    div.appendChild(label); div.appendChild(slider); div.appendChild(valueDisplay);
  }

  private createToggle(div: HTMLElement, element: any, data: any): void {
    div.className += ' ui-toggle';
    const label = document.createElement('label'); label.textContent = getText(element.label_key);
    const toggle = document.createElement('input'); toggle.type = 'checkbox'; toggle.checked = Boolean(this.getBoundValue(element.bind_value, data) || false);
    toggle.addEventListener('change', () => { this.setBoundValue(element.bind_value, toggle.checked); });
    div.appendChild(label); div.appendChild(toggle);
  }

  private getElementText(element: any): string {
    if (element.text_he) return element.text_he;
    if (element.text_key) return getText(element.text_key);
    return element.text || '';
  }

  private getBoundValue(bindPath: string, data: any): any {
    if (!bindPath) return null; const parts = bindPath.split('.'); let value = data;
    for (const part of parts) { if (value && value[part] !== undefined) value = value[part]; else return null; }
    return value;
  }

  private setBoundValue(bindPath: string, value: any): void {
    if (!bindPath) return;
    window.dispatchEvent(new CustomEvent('settingChanged', { detail: { path: bindPath, value } }));
  }

  private setupValueBinding(element: HTMLElement, bindPath: string, data: any): void {
    const updateValue = () => {
      const value = this.getBoundValue(bindPath, data);
      if (value !== null) {
        if (bindPath.includes('gold')) element.textContent = `${getText('ui_strings.common.gold')}: ${value}`;
        else if (bindPath.includes('version')) element.textContent = `${getText('ui_strings.menu.version')}: ${value}`;
        else element.textContent = value;
      }
    };
    updateValue();
    const interval = setInterval(updateValue, 100) as unknown as number;
    element.setAttribute('data-update-interval', String(interval));
  }

  private setupNavigation(navigation: Record<string, string>): void {
    for (const [elementId, action] of Object.entries(navigation)) {
      const element = this.elements.get(elementId); if (!element) continue;
      element.addEventListener('click', () => { this.handleNavigation(action); });
      element.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.handleNavigation(action); }
      });
    }
  }

  private setupCharacterSelection(action: string): void {
    const cards = (this.overlay || document).querySelectorAll('.character-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        cards.forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        const characterId = (card as HTMLElement).getAttribute('data-character-id');
        if ((window as any).gameState) (window as any).gameState.selectedCharacter = characterId;
        setTimeout(() => this.handleNavigation(action), 500);
      });
    });
  }

  private setupStageSelection(action: string): void { this.stageSelectionAction = action; }
  private setupScreenClick(action: string): void {
    this.overlay?.addEventListener('click', (e) => { if (e.target === this.overlay) this.handleNavigation(action); });
  }

  selectCharacter(characterId: string): void {
    if ((window as any).gameState) (window as any).gameState.selectedCharacter = characterId;
    if (this.currentScreen === 'character_select') {
      const layout = getUILayout(); const screen = layout.screens?.character_select;
      if (screen?.on_select_character) setTimeout(() => this.handleNavigation(screen.on_select_character), 500);
    }
  }

  selectStage(stageId: string): void {
    if ((window as any).gameState) (window as any).gameState.selectedStage = stageId;
    if (this.stageSelectionAction) this.handleNavigation(this.stageSelectionAction);
  }

  buyShopItem(itemId: string, cost: number): void {
    window.dispatchEvent(new CustomEvent('buyShopItem', { detail: { itemId, cost } }));
  }

  private handleNavigation(action: string): void {
    if (action.startsWith('goto:')) {
      const screenId = action.substring(5);
      window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: { screenId } }));
    } else if (action === 'start_game') {
      window.dispatchEvent(new CustomEvent('startGame'));
    } else {
      console.log('Unknown navigation action:', action);
    }
  }

  private async transitionOut(): Promise<void> {
    return new Promise((resolve) => { this.screenTransition?.classList.add('active'); setTimeout(resolve, 150); });
  }
  private async transitionIn(): Promise<void> {
    return new Promise((resolve) => { setTimeout(() => { this.screenTransition?.classList.remove('active'); resolve(); }, 150); });
  }

  clearScreen(): void {
    if (this.overlay) this.overlay.innerHTML = '';
    this.elements.clear(); this.callbacks.clear();
    const intervals = (this.overlay || document).querySelectorAll('[data-update-interval]');
    intervals.forEach((el) => { const v = (el as HTMLElement).getAttribute('data-update-interval'); if (v) clearInterval(parseInt(v)); });
    this.currentScreen = null;
  }

  setBackground(background: any): void {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    if (background.sprite) {
      canvas.style.backgroundImage = `url('hebrew_vampire_survivors_package/${background.sprite}')`;
      canvas.style.backgroundSize = 'cover';
      canvas.style.backgroundPosition = 'center';
    }
  }

  isMobile(): boolean { return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent); }

  // HUD for gameplay
  createHUD(): void {
    this.clearScreen();
    const xpBar = document.createElement('div'); xpBar.className = 'xp-bar top'; xpBar.innerHTML = '<div class="xp-fill"></div>';
    document.body.appendChild(xpBar);
    const xpLevel = document.createElement('div'); xpLevel.className = 'xp-level'; xpBar.appendChild(xpLevel);
    const container = document.getElementById('gameContainer');
    const adjustLayout = () => { const h = xpBar.getBoundingClientRect().height || 16; if (container) { container.style.marginTop = `${h}px`; container.style.height = `calc(100vh - ${h}px)`; } };
    adjustLayout(); window.addEventListener('resize', adjustLayout); this._xpAdjustHandler = adjustLayout;
    const timer = document.createElement('div'); timer.className = 'hud-element'; Object.assign(timer.style, { position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)' }); timer.textContent = '00:00'; document.body.appendChild(timer);
    const gold = document.createElement('div'); gold.className = 'hud-element'; Object.assign(gold.style, { position: 'fixed', top: '60px', right: '20px' }); gold.textContent = `${getText('ui_strings.hud.gold')}: 0`; document.body.appendChild(gold);
    this.hudElements = { xpBar, xpLevel, timer, gold } as any;
  }

  updateHUD(gameState: any): void {
    if (!this.hudElements) return;
    const { xpBar, xpLevel, timer, gold } = this.hudElements;
    if (gameState.player) {
      const xpPercent = (gameState.player.xp / gameState.player.xpToNext) * 100;
      (xpBar.querySelector('.xp-fill') as HTMLElement).style.width = `${xpPercent}%`;
      let levelLabel = 'רמה';
      try { const t = getText('ui_strings.hud.level'); if (t && !/ui_strings/.test(t)) levelLabel = t; } catch (e) { void e; }
      xpLevel.textContent = `${levelLabel}: ${gameState.player.level}`;
      gold.textContent = `${getText('ui_strings.hud.gold')}: ${gameState.player.gold}`;
    }
    if (gameState.gameTime !== undefined) timer.textContent = TimeUtils.formatTime(gameState.gameTime);
  }

  clearHUD(): void {
    if (this.hudElements) {
      Object.values(this.hudElements).forEach((el) => { if (el.parentNode) el.parentNode.removeChild(el); });
      this.hudElements = null;
    }
    const container = document.getElementById('gameContainer'); if (container) { container.style.marginTop = '0px'; container.style.height = '100vh'; }
    if (this._xpAdjustHandler) { window.removeEventListener('resize', this._xpAdjustHandler); this._xpAdjustHandler = null; }
  }

  showLevelUpPanel(options: any[], onSelect: (opt: any) => void): HTMLElement {
    const panel = document.createElement('div'); panel.className = 'level-up-panel';
    const title = document.createElement('h2'); title.textContent = getText('ui_strings.level_up.title'); panel.appendChild(title);
    const subtitle = document.createElement('p'); subtitle.textContent = getText('ui_strings.level_up.choose_one'); panel.appendChild(subtitle);
    const optionsContainer = document.createElement('div'); Object.assign(optionsContainer.style, { display: 'flex', justifyContent: 'center', flexWrap: 'wrap' });
    options.forEach((option) => {
      const optionDiv = document.createElement('div'); optionDiv.className = 'weapon-option'; optionDiv.innerHTML = `<h3>${option.name}</h3><p>${option.description}</p>`; optionDiv.addEventListener('click', () => { panel.remove(); onSelect(option); }); optionsContainer.appendChild(optionDiv);
    });
    panel.appendChild(optionsContainer); document.body.appendChild(panel); return panel;
  }

  showDamageNumber(x: number, y: number, damage: number, color = '#e74c3c'): void {
    const el = document.createElement('div'); el.className = 'damage-number'; el.textContent = String(Math.round(damage)); el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.color = color; document.body.appendChild(el);
    setTimeout(() => { el.parentNode?.removeChild(el); }, 1000);
  }
}

declare global {
  interface Window { UIManager: typeof UIManagerTS; }
}
(window as any).UIManager = UIManagerTS;

export {};


