/**
 * Stress Test Utilities - Create scenarios with 100+ entities for performance validation
 */

import type { ActiveEnemy } from "@/components/WaveManager";
import type { EnemyId } from "../../types";
import type { XpOrbProps } from "@/components/XpOrb";

export interface StressTestConfig {
  enemyCount: number;
  projectilesPerSecond: number;
  xpOrbCount: number;
  duration: number; // seconds
}

/**
 * Predefined stress test scenarios
 */
export const STRESS_TEST_SCENARIOS = {
  light: {
    enemyCount: 30,
    projectilesPerSecond: 20,
    xpOrbCount: 20,
    duration: 60,
  },
  medium: {
    enemyCount: 75,
    projectilesPerSecond: 50,
    xpOrbCount: 50,
    duration: 120,
  },
  heavy: {
    enemyCount: 150,
    projectilesPerSecond: 100,
    xpOrbCount: 100,
    duration: 180,
  },
  extreme: {
    enemyCount: 300,
    projectilesPerSecond: 200,
    xpOrbCount: 200,
    duration: 300,
  },
} as const;

interface SpawnPosition {
  x: number;
  y: number;
}

/**
 * Generate random spawn positions around the player
 */
export function generateSpawnPositions({
  count,
  playerX = 0,
  playerY = 0,
  minDistance = 5,
  maxDistance = 15,
}: {
  count: number;
  playerX?: number;
  playerY?: number;
  minDistance?: number;
  maxDistance?: number;
}): SpawnPosition[] {
  const positions: SpawnPosition[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const distance = minDistance + Math.random() * (maxDistance - minDistance);

    positions.push({
      x: playerX + Math.cos(angle) * distance,
      y: playerY + Math.sin(angle) * distance,
    });
  }

  return positions;
}

/**
 * Generate enemy spawn data for stress testing
 */
export function generateStressTestEnemies({
  count,
  enemyTypes,
  playerPosition = { x: 0, y: 0 },
}: {
  count: number;
  enemyTypes: EnemyId[];
  playerPosition?: { x: number; y: number };
}): ActiveEnemy[] {
  const positions = generateSpawnPositions({
    count,
    playerX: playerPosition.x,
    playerY: playerPosition.y,
    minDistance: 5,
    maxDistance: 20,
  });

  return positions.map((pos, index) => {
    const typeId = enemyTypes[index % enemyTypes.length];
    if (!typeId) {
      throw new Error("No enemy types provided for stress test");
    }
    return {
      id: `stress-enemy-${index}`,
      typeId,
      position: [pos.x, pos.y, 0] as [number, number, number],
    };
  });
}

/**
 * Generate XP orb spawn data for stress testing
 */
export function generateStressTestXpOrbs({
  count,
  playerPosition = { x: 0, y: 0 },
  xpValue = 10,
}: {
  count: number;
  playerPosition?: { x: number; y: number };
  xpValue?: number;
}): XpOrbProps[] {
  const positions = generateSpawnPositions({
    count,
    playerX: playerPosition.x,
    playerY: playerPosition.y,
    minDistance: 2,
    maxDistance: 10,
  });

  return positions.map((pos, index) => ({
    id: `stress-xp-${index}`,
    position: [pos.x, pos.y, 0],
    xpValue,
  }));
}

/**
 * Performance test result
 */
export interface PerformanceTestResult {
  scenario: string;
  duration: number;
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  averageEntityCount: number;
  maxEntityCount: number;
  averageDrawCalls: number;
  averageMemoryMB: number;
  passed: boolean;
  issues: string[];
}

/**
 * Performance test runner
 */
export class PerformanceTestRunner {
  private fpsHistory: number[] = [];
  private entityCountHistory: number[] = [];
  private drawCallHistory: number[] = [];
  private memoryHistory: number[] = [];
  private startTime = 0;
  private testDuration = 0;

  start(duration: number): void {
    this.fpsHistory = [];
    this.entityCountHistory = [];
    this.drawCallHistory = [];
    this.memoryHistory = [];
    this.startTime = Date.now();
    this.testDuration = duration * 1000; // Convert to ms
  }

  recordFrame({
    fps,
    entityCount,
    drawCalls,
    memoryMB,
  }: {
    fps: number;
    entityCount: number;
    drawCalls: number;
    memoryMB: number;
  }): void {
    this.fpsHistory.push(fps);
    this.entityCountHistory.push(entityCount);
    this.drawCallHistory.push(drawCalls);
    this.memoryHistory.push(memoryMB);
  }

  isComplete(): boolean {
    return Date.now() - this.startTime >= this.testDuration;
  }

  getResults(scenario: string): PerformanceTestResult {
    const issues: string[] = [];

    // Calculate averages
    const avgFPS =
      this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    const minFPS = Math.min(...this.fpsHistory);
    const maxFPS = Math.max(...this.fpsHistory);

    const avgEntityCount =
      this.entityCountHistory.reduce((a, b) => a + b, 0) /
      this.entityCountHistory.length;
    const maxEntityCount = Math.max(...this.entityCountHistory);

    const avgDrawCalls =
      this.drawCallHistory.reduce((a, b) => a + b, 0) /
      this.drawCallHistory.length;

    const avgMemory =
      this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length;

    // Check for issues
    if (avgFPS < 55) {
      issues.push(`Average FPS below target (${avgFPS.toFixed(1)} < 55)`);
    }
    if (minFPS < 45) {
      issues.push(`Minimum FPS too low (${minFPS} < 45)`);
    }
    if (avgMemory > 500) {
      issues.push(`High memory usage (${avgMemory.toFixed(0)}MB > 500MB)`);
    }

    return {
      scenario,
      duration: this.testDuration / 1000,
      averageFPS: Math.round(avgFPS),
      minFPS,
      maxFPS,
      averageEntityCount: Math.round(avgEntityCount),
      maxEntityCount,
      averageDrawCalls: Math.round(avgDrawCalls),
      averageMemoryMB: Math.round(avgMemory),
      passed: issues.length === 0,
      issues,
    };
  }

  reset(): void {
    this.fpsHistory = [];
    this.entityCountHistory = [];
    this.drawCallHistory = [];
    this.memoryHistory = [];
    this.startTime = 0;
    this.testDuration = 0;
  }
}

/**
 * Global test runner instance
 */
export const performanceTestRunner = new PerformanceTestRunner();

/**
 * Log test results to console
 */
export function logTestResults(result: PerformanceTestResult): void {
  console.log("\n=== Performance Test Results ===");
  console.log(`Scenario: ${result.scenario}`);
  console.log(`Duration: ${result.duration}s`);
  console.log(
    `FPS: ${result.averageFPS} avg, ${result.minFPS} min, ${result.maxFPS} max`
  );
  console.log(
    `Entities: ${result.averageEntityCount} avg, ${result.maxEntityCount} max`
  );
  console.log(`Draw Calls: ${result.averageDrawCalls} avg`);
  console.log(`Memory: ${result.averageMemoryMB}MB avg`);
  console.log(`Status: ${result.passed ? "✅ PASSED" : "❌ FAILED"}`);

  if (result.issues.length > 0) {
    console.log("\nIssues:");
    result.issues.forEach((issue) => console.log(`  - ${issue}`));
  }

  console.log("================================\n");
}
