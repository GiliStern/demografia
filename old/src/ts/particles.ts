import { MathUtils } from './utils';

class ParticleSystemTS {
  particles: ParticleTS[] = [];
  maxParticles = 500;
  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]; p.update(deltaTime);
      if (p.shouldRemove) this.particles.splice(i, 1);
    }
  }
  render(ctx: CanvasRenderingContext2D): void { for (const p of this.particles) p.render(ctx); }
  addParticle(p: ParticleTS): void { if (this.particles.length < this.maxParticles) this.particles.push(p); }
  createHitParticles(x: number, y: number, count = 5): void { for (let i = 0; i < count; i++) this.addParticle(new HitParticleTS(x, y)); }
  createDeathParticles(x: number, y: number, count = 8): void { for (let i = 0; i < count; i++) this.addParticle(new DeathParticleTS(x, y)); }
  createPickupParticles(x: number, y: number, type: string, count = 3): void { for (let i = 0; i < count; i++) this.addParticle(new PickupParticleTS(x, y, type)); }
  createLevelUpParticles(x: number, y: number, count = 15): void { for (let i = 0; i < count; i++) this.addParticle(new LevelUpParticleTS(x, y)); }
  createBloodParticles(x: number, y: number, count = 6): void { for (let i = 0; i < count; i++) this.addParticle(new BloodParticleTS(x, y)); }
  createExplosionParticles(x: number, y: number, count = 20): void { for (let i = 0; i < count; i++) this.addParticle(new ExplosionParticleTS(x, y)); }
  clear(): void { this.particles = []; }
}

class ParticleTS {
  x: number; y: number; vx = 0; vy = 0; lifetime = 1.0; maxLifetime = 1.0; size = 2; color = '#ffffff'; opacity = 1.0; gravity = 0; friction = 0.98; shouldRemove = false; rotation = 0; rotationSpeed = 0;
  constructor(x: number, y: number) { this.x = x; this.y = y; this.maxLifetime = this.lifetime; }
  update(deltaTime: number): void { this.x += this.vx * deltaTime; this.y += this.vy * deltaTime; this.vy += this.gravity * deltaTime; this.vx *= this.friction; this.vy *= this.friction; this.rotation += this.rotationSpeed * deltaTime; this.lifetime -= deltaTime; if (this.lifetime <= 0) this.shouldRemove = true; this.opacity = this.lifetime / this.maxLifetime; }
  render(ctx: CanvasRenderingContext2D): void { if (this.opacity <= 0) return; ctx.save(); ctx.globalAlpha = this.opacity; ctx.translate(this.x, this.y); ctx.rotate(this.rotation); this.draw(ctx); ctx.restore(); }
  draw(ctx: CanvasRenderingContext2D): void { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI * 2); ctx.fill(); }
}

class HitParticleTS extends ParticleTS {
  constructor(x: number, y: number) { super(x, y); const angle = Math.random() * Math.PI * 2; const speed = MathUtils.random(50, 150); this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed; this.lifetime = MathUtils.random(0.2, 0.5); this.maxLifetime = this.lifetime; this.size = MathUtils.random(2, 4); this.color = MathUtils.randomChoice(['#ff6b6b', '#ffa502', '#ffff00']); this.gravity = 100; this.friction = 0.95; }
  draw(ctx: CanvasRenderingContext2D): void { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2); ctx.fill(); }
}

class DeathParticleTS extends ParticleTS {
  constructor(x: number, y: number) { super(x, y); const angle = Math.random() * Math.PI * 2; const speed = MathUtils.random(80, 200); this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed; this.lifetime = MathUtils.random(0.5, 1.5); this.maxLifetime = this.lifetime; this.size = MathUtils.random(3, 8); this.color = MathUtils.randomChoice(['#e74c3c', '#c0392b', '#8b0000']); this.gravity = 150; this.friction = 0.92; this.rotationSpeed = MathUtils.random(-5, 5); }
  draw(ctx: CanvasRenderingContext2D): void { ctx.fillStyle = this.color; ctx.beginPath(); ctx.moveTo(this.size, 0); for (let i = 1; i < 6; i++) { const ang = (i / 6) * Math.PI * 2; const r = this.size * MathUtils.random(0.5, 1.2); ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r); } ctx.closePath(); ctx.fill(); }
}

class PickupParticleTS extends ParticleTS {
  type: string;
  constructor(x: number, y: number, type: string) { super(x, y); this.type = type; const angle = Math.random() * Math.PI * 2; const speed = MathUtils.random(30, 80); this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed - 50; this.lifetime = MathUtils.random(0.8, 1.2); this.maxLifetime = this.lifetime; this.size = MathUtils.random(2, 5); this.gravity = 50; this.friction = 0.96; switch (type) { case 'xp': this.color = '#3498db'; break; case 'gold': this.color = '#f1c40f'; break; case 'health': this.color = '#e74c3c'; break; default: this.color = '#ffffff'; } }
  draw(ctx: CanvasRenderingContext2D): void { ctx.fillStyle = this.color; ctx.beginPath(); ctx.moveTo(this.size, 0); ctx.lineTo(this.size * 0.3, this.size * 0.3); ctx.lineTo(0, this.size); ctx.lineTo(-this.size * 0.3, this.size * 0.3); ctx.lineTo(-this.size, 0); ctx.lineTo(-this.size * 0.3, -this.size * 0.3); ctx.lineTo(0, -this.size); ctx.lineTo(this.size * 0.3, -this.size * 0.3); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, this.size * 0.2, 0, Math.PI * 2); ctx.fill(); }
}

class LevelUpParticleTS extends ParticleTS {
  constructor(x: number, y: number) { super(x, y); const angle = Math.random() * Math.PI * 2; const speed = MathUtils.random(100, 300); this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed - 100; this.lifetime = MathUtils.random(1.0, 2.0); this.maxLifetime = this.lifetime; this.size = MathUtils.random(3, 8); this.color = MathUtils.randomChoice(['#f39c12', '#e67e22', '#d35400', '#ffff00']); this.gravity = 50; this.friction = 0.98; this.rotationSpeed = MathUtils.random(-10, 10); }
  draw(ctx: CanvasRenderingContext2D): void { ctx.fillStyle = this.color; const spikes = 5; const outerRadius = this.size; const innerRadius = this.size * 0.4; ctx.beginPath(); for (let i = 0; i < spikes * 2; i++) { const ang = (i / (spikes * 2)) * Math.PI * 2; const r = i % 2 === 0 ? outerRadius : innerRadius; const px = Math.cos(ang) * r; const py = Math.sin(ang) * r; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, this.size * 0.2, 0, Math.PI * 2); ctx.fill(); }
}

class BloodParticleTS extends ParticleTS {
  constructor(x: number, y: number) { super(x, y); const angle = Math.random() * Math.PI * 2; const speed = MathUtils.random(50, 120); this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed; this.lifetime = MathUtils.random(0.3, 0.8); this.maxLifetime = this.lifetime; this.size = MathUtils.random(2, 6); this.color = MathUtils.randomChoice(['#8b0000', '#a50000', '#c00000']); this.gravity = 200; this.friction = 0.94; }
  draw(ctx: CanvasRenderingContext2D): void { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(0, -this.size * 0.3, this.size * 0.7, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, this.size * 0.4); ctx.lineTo(-this.size * 0.3, 0); ctx.lineTo(this.size * 0.3, 0); ctx.closePath(); ctx.fill(); }
}

class ExplosionParticleTS extends ParticleTS {
  constructor(x: number, y: number) { super(x, y); const angle = Math.random() * Math.PI * 2; const speed = MathUtils.random(200, 500); this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed; this.lifetime = MathUtils.random(0.5, 1.0); this.maxLifetime = this.lifetime; this.size = MathUtils.random(4, 12); this.color = MathUtils.randomChoice(['#ff6b6b', '#ffa502', '#ff3742', '#ffff00']); this.gravity = 100; this.friction = 0.95; this.rotationSpeed = MathUtils.random(-15, 15); }
  draw(ctx: CanvasRenderingContext2D): void { const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size); gradient.addColorStop(0, this.color); gradient.addColorStop(0.5, this.color + '80'); gradient.addColorStop(1, this.color + '00'); ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI * 2); ctx.fill(); }
}

class ScreenFlashTS {
  color: string; duration: number; maxDuration: number; intensity: number; active = true;
  constructor(color = '#ffffff', duration = 0.1, intensity = 0.3) { this.color = color; this.duration = duration; this.maxDuration = duration; this.intensity = intensity; }
  update(deltaTime: number): void { this.duration -= deltaTime; if (this.duration <= 0) this.active = false; }
  render(ctx: CanvasRenderingContext2D): void { if (!this.active) return; const alpha = (this.duration / this.maxDuration) * this.intensity; ctx.save(); ctx.fillStyle = this.color; ctx.globalAlpha = alpha; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); }
}

class TrailTS {
  points: Array<{ x: number; y: number; alpha: number }> = []; maxPoints: number;
  constructor(maxPoints = 10) { this.maxPoints = maxPoints; }
  addPoint(x: number, y: number): void { this.points.push({ x, y, alpha: 1.0 }); if (this.points.length > this.maxPoints) this.points.shift(); }
  update(deltaTime: number): void { for (let i = this.points.length - 1; i >= 0; i--) { this.points[i].alpha -= deltaTime * 2; if (this.points[i].alpha <= 0) this.points.splice(i, 1); } }
  render(ctx: CanvasRenderingContext2D, color = '#ffffff', width = 2): void { if (this.points.length < 2) return; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; for (let i = 0; i < this.points.length - 1; i++) { const p = this.points[i]; const n = this.points[i + 1]; ctx.globalAlpha = p.alpha * 0.5; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(n.x, n.y); ctx.stroke(); } ctx.restore(); }
}

class FloatingTextTS {
  x: number; y: number; text: string; color: string; fontSize: number; vy = -50; lifetime = 2.0; maxLifetime = 2.0; opacity = 1.0;
  constructor(x: number, y: number, text: string, color = '#ffffff', fontSize = 16) { this.x = x; this.y = y; this.text = text; this.color = color; this.fontSize = fontSize; this.maxLifetime = this.lifetime; }
  update(deltaTime: number): boolean { this.y += this.vy * deltaTime; this.lifetime -= deltaTime; this.opacity = this.lifetime / this.maxLifetime; return this.lifetime > 0; }
  render(ctx: CanvasRenderingContext2D): void { ctx.save(); ctx.fillStyle = this.color; ctx.font = `bold ${this.fontSize}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = this.opacity; ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.strokeText(this.text, this.x, this.y); ctx.fillText(this.text, this.x, this.y); ctx.restore(); }
}

declare global {
  interface Window {
    ParticleSystem: typeof ParticleSystemTS;
    Particle: typeof ParticleTS;
    HitParticle: typeof HitParticleTS;
    DeathParticle: typeof DeathParticleTS;
    PickupParticle: typeof PickupParticleTS;
    LevelUpParticle: typeof LevelUpParticleTS;
    BloodParticle: typeof BloodParticleTS;
    ExplosionParticle: typeof ExplosionParticleTS;
    ScreenFlash: typeof ScreenFlashTS;
    Trail: typeof TrailTS;
    FloatingText: typeof FloatingTextTS;
  }
}

(window as any).ParticleSystem = ParticleSystemTS;
(window as any).Particle = ParticleTS;
(window as any).HitParticle = HitParticleTS;
(window as any).DeathParticle = DeathParticleTS;
(window as any).PickupParticle = PickupParticleTS;
(window as any).LevelUpParticle = LevelUpParticleTS;
(window as any).BloodParticle = BloodParticleTS;
(window as any).ExplosionParticle = ExplosionParticleTS;
(window as any).ScreenFlash = ScreenFlashTS;
(window as any).Trail = TrailTS;
(window as any).FloatingText = FloatingTextTS;

export {};


