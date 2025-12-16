/**
 * Production performance monitoring utility
 * Tracks FPS, frame time variance, and performance metrics
 */

class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private frameTimes: number[] = [];
  private maxFrameTimeSamples = 60;

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
    const squaredDiffs = this.frameTimes.map(ft => Math.pow(ft - avg, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / this.frameTimes.length);
  }

  getStats() {
    return {
      fps: this.fps,
      avgFrameTime: this.getAverageFrameTime().toFixed(2),
      frameTimeVariance: this.getFrameTimeVariance().toFixed(2),
      status: this.fps >= 55 ? 'good' : this.fps >= 45 ? 'ok' : 'poor'
    };
  }

  logStats() {
    const stats = this.getStats();
    console.log(`[Performance] FPS: ${stats.fps} | Avg Frame Time: ${stats.avgFrameTime}ms | Variance: ${stats.frameTimeVariance}ms | Status: ${stats.status}`);
  }
}

export const performanceMonitor = new PerformanceMonitor();



