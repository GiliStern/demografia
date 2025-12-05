const files = [
  "config.js",
  "utils.js",
  // "input.js", // migrated to TS: ts/input.ts
  // "soundGenerator.js", // migrated to TS: ts/soundGenerator.ts
  // "audio.js", // migrated to TS: ts/audio.ts
  // "sprites.js", // migrated to TS: ts/sprites.ts
  // "ui.js", // migrated to TS: ts/ui.ts
  // "saveSystem.js", // migrated to TS: ts/saveSystem.ts
  // "screens.js", // migrated to TS: ts/screens.ts
  // "gameEngine.js", // migrated to TS: ts/gameEngine.ts
  // "entities.js", // migrated to TS: ts/entities.ts
  // "weapons.js", // migrated to TS: ts/weapons.ts
  // "particles.js", // migrated to TS: ts/particles.ts
  "main.js",
];

(async () => {
  for (const f of files) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `/src/${f}`;
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${f}`));
      document.body.appendChild(s);
    });
  }
  // If DOMContentLoaded already fired before we attached the listener in main.js,
  // manually dispatch it to trigger initialization.
  if (document.readyState !== "loading") {
    document.dispatchEvent(new Event("DOMContentLoaded"));
  }
})();
export {};
