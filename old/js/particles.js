// Particle system for visual effects

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }
    
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.shouldRemove) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        for (const particle of this.particles) {
            particle.render(ctx);
        }
    }
    
    addParticle(particle) {
        if (this.particles.length < this.maxParticles) {
            this.particles.push(particle);
        }
    }
    
    createHitParticles(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            const particle = new HitParticle(x, y);
            this.addParticle(particle);
        }
    }
    
    createDeathParticles(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            const particle = new DeathParticle(x, y);
            this.addParticle(particle);
        }
    }
    
    createPickupParticles(x, y, type, count = 3) {
        for (let i = 0; i < count; i++) {
            const particle = new PickupParticle(x, y, type);
            this.addParticle(particle);
        }
    }
    
    createLevelUpParticles(x, y, count = 15) {
        for (let i = 0; i < count; i++) {
            const particle = new LevelUpParticle(x, y);
            this.addParticle(particle);
        }
    }
    
    createBloodParticles(x, y, count = 6) {
        for (let i = 0; i < count; i++) {
            const particle = new BloodParticle(x, y);
            this.addParticle(particle);
        }
    }
    
    createExplosionParticles(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const particle = new ExplosionParticle(x, y);
            this.addParticle(particle);
        }
    }
    
    clear() {
        this.particles = [];
    }
}

// Base particle class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.lifetime = 1.0;
        this.maxLifetime = this.lifetime;
        this.size = 2;
        this.color = '#ffffff';
        this.opacity = 1.0;
        this.gravity = 0;
        this.friction = 0.98;
        this.shouldRemove = false;
        this.rotation = 0;
        this.rotationSpeed = 0;
    }
    
    update(deltaTime) {
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Apply gravity
        this.vy += this.gravity * deltaTime;
        
        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Update rotation
        this.rotation += this.rotationSpeed * deltaTime;
        
        // Update lifetime
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.shouldRemove = true;
        }
        
        // Fade out over time
        this.opacity = this.lifetime / this.maxLifetime;
    }
    
    render(ctx) {
        if (this.opacity <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        this.draw(ctx);
        
        ctx.restore();
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Hit effect particles
class HitParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = MathUtils.random(50, 150);
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.lifetime = MathUtils.random(0.2, 0.5);
        this.maxLifetime = this.lifetime;
        this.size = MathUtils.random(2, 4);
        this.color = MathUtils.randomChoice(['#ff6b6b', '#ffa502', '#ffff00']);
        this.gravity = 100;
        this.friction = 0.95;
    }
    
    draw(ctx) {
        // Draw as a small burst
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add inner bright spot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Death effect particles
class DeathParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = MathUtils.random(80, 200);
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.lifetime = MathUtils.random(0.5, 1.5);
        this.maxLifetime = this.lifetime;
        this.size = MathUtils.random(3, 8);
        this.color = MathUtils.randomChoice(['#e74c3c', '#c0392b', '#8b0000']);
        this.gravity = 150;
        this.friction = 0.92;
        this.rotationSpeed = MathUtils.random(-5, 5);
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        
        // Draw as irregular shape
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        for (let i = 1; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = this.size * MathUtils.random(0.5, 1.2);
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        ctx.closePath();
        ctx.fill();
    }
}

// Pickup effect particles
class PickupParticle extends Particle {
    constructor(x, y, type) {
        super(x, y);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = MathUtils.random(30, 80);
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 50; // Upward bias
        this.lifetime = MathUtils.random(0.8, 1.2);
        this.maxLifetime = this.lifetime;
        this.size = MathUtils.random(2, 5);
        this.gravity = 50;
        this.friction = 0.96;
        this.type = type;
        
        // Set color based on pickup type
        switch (type) {
            case 'xp':
                this.color = '#3498db';
                break;
            case 'gold':
                this.color = '#f1c40f';
                break;
            case 'health':
                this.color = '#e74c3c';
                break;
            default:
                this.color = '#ffffff';
        }
    }
    
    draw(ctx) {
        // Sparkle effect
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(this.size * 0.3, this.size * 0.3);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size * 0.3, this.size * 0.3);
        ctx.lineTo(-this.size, 0);
        ctx.lineTo(-this.size * 0.3, -this.size * 0.3);
        ctx.lineTo(0, -this.size);
        ctx.lineTo(this.size * 0.3, -this.size * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Inner glow
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Level up effect particles
class LevelUpParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = MathUtils.random(100, 300);
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 100; // Strong upward bias
        this.lifetime = MathUtils.random(1.0, 2.0);
        this.maxLifetime = this.lifetime;
        this.size = MathUtils.random(3, 8);
        this.color = MathUtils.randomChoice(['#f39c12', '#e67e22', '#d35400', '#ffff00']);
        this.gravity = 50;
        this.friction = 0.98;
        this.rotationSpeed = MathUtils.random(-10, 10);
    }
    
    draw(ctx) {
        // Draw as a glowing star
        ctx.fillStyle = this.color;
        
        const spikes = 5;
        const outerRadius = this.size;
        const innerRadius = this.size * 0.4;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i / (spikes * 2)) * Math.PI * 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // Bright center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Blood particles for combat
class BloodParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = MathUtils.random(50, 120);
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.lifetime = MathUtils.random(0.3, 0.8);
        this.maxLifetime = this.lifetime;
        this.size = MathUtils.random(2, 6);
        this.color = MathUtils.randomChoice(['#8b0000', '#a50000', '#c00000']);
        this.gravity = 200;
        this.friction = 0.94;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        
        // Draw as droplet
        ctx.beginPath();
        ctx.arc(0, -this.size * 0.3, this.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(0, this.size * 0.4);
        ctx.lineTo(-this.size * 0.3, 0);
        ctx.lineTo(this.size * 0.3, 0);
        ctx.closePath();
        ctx.fill();
    }
}

// Explosion particles
class ExplosionParticle extends Particle {
    constructor(x, y) {
        super(x, y);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = MathUtils.random(200, 500);
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.lifetime = MathUtils.random(0.5, 1.0);
        this.maxLifetime = this.lifetime;
        this.size = MathUtils.random(4, 12);
        this.color = MathUtils.randomChoice(['#ff6b6b', '#ffa502', '#ff3742', '#ffff00']);
        this.gravity = 100;
        this.friction = 0.95;
        this.rotationSpeed = MathUtils.random(-15, 15);
    }
    
    draw(ctx) {
        // Draw as flame-like shape
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + '80'); // Semi-transparent
        gradient.addColorStop(1, this.color + '00'); // Fully transparent
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Screen flash effect
class ScreenFlash {
    constructor(color = '#ffffff', duration = 0.1, intensity = 0.3) {
        this.color = color;
        this.duration = duration;
        this.maxDuration = duration;
        this.intensity = intensity;
        this.active = true;
    }
    
    update(deltaTime) {
        this.duration -= deltaTime;
        if (this.duration <= 0) {
            this.active = false;
        }
    }
    
    render(ctx) {
        if (!this.active) return;
        
        const alpha = (this.duration / this.maxDuration) * this.intensity;
        
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }
}

// Trail effect for fast-moving objects
class Trail {
    constructor(maxPoints = 10) {
        this.points = [];
        this.maxPoints = maxPoints;
    }
    
    addPoint(x, y) {
        this.points.push({ x, y, alpha: 1.0 });
        
        if (this.points.length > this.maxPoints) {
            this.points.shift();
        }
    }
    
    update(deltaTime) {
        for (let i = this.points.length - 1; i >= 0; i--) {
            this.points[i].alpha -= deltaTime * 2;
            
            if (this.points[i].alpha <= 0) {
                this.points.splice(i, 1);
            }
        }
    }
    
    render(ctx, color = '#ffffff', width = 2) {
        if (this.points.length < 2) return;
        
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        
        for (let i = 0; i < this.points.length - 1; i++) {
            const point = this.points[i];
            const nextPoint = this.points[i + 1];
            
            ctx.globalAlpha = point.alpha * 0.5;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(nextPoint.x, nextPoint.y);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Floating text effect
class FloatingText {
    constructor(x, y, text, color = '#ffffff', fontSize = 16) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.fontSize = fontSize;
        this.vy = -50; // Float upward
        this.lifetime = 2.0;
        this.maxLifetime = this.lifetime;
        this.opacity = 1.0;
    }
    
    update(deltaTime) {
        this.y += this.vy * deltaTime;
        this.lifetime -= deltaTime;
        this.opacity = this.lifetime / this.maxLifetime;
        
        return this.lifetime > 0;
    }
    
    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = this.opacity;
        
        // Outline for better visibility
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        
        ctx.restore();
    }
}

// Export particle system
window.ParticleSystem = ParticleSystem;
window.Particle = Particle;
window.HitParticle = HitParticle;
window.DeathParticle = DeathParticle;
window.PickupParticle = PickupParticle;
window.LevelUpParticle = LevelUpParticle;
window.BloodParticle = BloodParticle;
window.ExplosionParticle = ExplosionParticle;
window.ScreenFlash = ScreenFlash;
window.Trail = Trail;
window.FloatingText = FloatingText;

