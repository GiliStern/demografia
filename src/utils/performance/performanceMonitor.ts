/**
 * Enhanced performance monitoring utility
 * Tracks FPS, frame time variance, entity counts, memory usage, and draw calls
 */

interface EntityCounts {
  enemies: number;
  projectiles: number;
  xpOrbs: number;
  total: number;
}

interface PoolStats {
  projectiles: { active: number; available: number; total: number };
  enemies: { active: number; available: number; total: number };
  xpOrbs: { active: number; available: number; total: number };
}

class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private frameTimes: number[] = [];
  private maxFrameTimeSamples = 60;

  // Entity tracking
  private entityCounts: EntityCounts = {
    enemies: 0,
    projectiles: 0,
    xpOrbs: 0,
    total: 0,
  };

  // Pool statistics
  private poolStats: PoolStats = {
    projectiles: { active: 0, available: 0, total: 0 },
    enemies: { active: 0, available: 0, total: 0 },
    xpOrbs: { active: 0, available: 0, total: 0 },
  };

  // Draw call tracking
  private drawCalls = 0;

  // Memory tracking
  private memoryUsage = 0;

  updateFrame(delta: number) {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastTime;

    // Track frame times for variance analysis
    const frameTime = delta * 1000; // Convert to ms
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxFrameTimeSamples) {
      this.frameTimes.shift();
    }

    // Update FPS every second
    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = now;

      // Update memory usage
      this.updateMemoryUsage();
    }
  }

  getFPS(): number {
    return this.fps;
  }

  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
  }

  getFrameTimeVariance(): number {
    if (this.frameTimes.length === 0) return 0;
    const avg = this.getAverageFrameTime();
    const squaredDiffs = this.frameTimes.map((ft) => Math.pow(ft - avg, 2));
    return Math.sqrt(
      squaredDiffs.reduce((a, b) => a + b, 0) / this.frameTimes.length
    );
  }

  /**
   * Update entity counts
   */
  setEntityCounts(counts: Partial<EntityCounts>): void {
    this.entityCounts = {
      ...this.entityCounts,
      ...counts,
    };
    this.entityCounts.total =
      this.entityCounts.enemies +
      this.entityCounts.projectiles +
      this.entityCounts.xpOrbs;
  }

  /**
   * Update pool statistics
   */
  setPoolStats(stats: Partial<PoolStats>): void {
    this.poolStats = {
      ...this.poolStats,
      ...stats,
    };
  }

  /**
   * Set draw call count
   */
  setDrawCalls(count: number): void {
    this.drawCalls = count;
  }

  /**
   * Update memory usage from performance.memory API
   */
  private updateMemoryUsage(): void {
    if ("memory" in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number } })
        .memory;
      if (memory) {
        this.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // Convert to MB
      }
    }
  }

  /**
   * Get entity counts
   */
  getEntityCounts(): EntityCounts {
    return { ...this.entityCounts };
  }

  /**
   * Get pool statistics
   */
  getPoolStats(): PoolStats {
    return { ...this.poolStats };
  }

  /**
   * Get draw call count
   */
  getDrawCalls(): number {
    return this.drawCalls;
  }

  /**
   * Get memory usage in MB
   */
  getMemoryUsage(): number {
    return this.memoryUsage;
  }

  getStats() {
    return {
      fps: this.fps,
      avgFrameTime: this.getAverageFrameTime().toFixed(2),
      frameTimeVariance: this.getFrameTimeVariance().toFixed(2),
      status: this.fps >= 55 ? "good" : this.fps >= 45 ? "ok" : "poor",
      entities: this.entityCounts,
      drawCalls: this.drawCalls,
      memoryMB: this.memoryUsage,
      pools: this.poolStats,
    };
  }

  logStats() {
    const stats = this.getStats();
    console.log(
      `[Performance] FPS: ${stats.fps} | Frame: ${stats.avgFrameTime}ms | Variance: ${stats.frameTimeVariance}ms | Status: ${stats.status}`
    );
    console.log(
      `[Entities] Total: ${stats.entities.total} (Enemies: ${stats.entities.enemies}, Projectiles: ${stats.entities.projectiles}, XP Orbs: ${stats.entities.xpOrbs})`
    );
    console.log(
      `[Rendering] Draw Calls: ${stats.drawCalls} | Memory: ${stats.memoryMB}MB`
    );
    console.log(
      `[Pools] Projectiles: ${stats.pools.projectiles.active}/${stats.pools.projectiles.total} | Enemies: ${stats.pools.enemies.active}/${stats.pools.enemies.total} | XP Orbs: ${stats.pools.xpOrbs.active}/${stats.pools.xpOrbs.total}`
    );
  }

  /**
   * Get a compact stats string for HUD display
   */
  getCompactStats(): string {
    const stats = this.getStats();
    return `FPS: ${stats.fps} | Entities: ${stats.entities.total} | Draw Calls: ${stats.drawCalls} | Memory: ${stats.memoryMB}MB`;
  }
}

export const performanceMonitor = new PerformanceMonitor();
