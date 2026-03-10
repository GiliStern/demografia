#!/usr/bin/env node
/**
 * Bundle size check - fails if main JS chunk exceeds the limit.
 * Run after `yarn build`. Used in CI to catch size regressions.
 */
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist", "assets");
const MAX_JS_BYTES = 3.5 * 1024 * 1024; // 3.5 MB

try {
  const files = readdirSync(DIST);
  const jsFiles = files.filter((f) => f.endsWith(".js") && f.startsWith("index-"));
  let totalBytes = 0;
  for (const f of jsFiles) {
    totalBytes += statSync(join(DIST, f)).size;
  }
  const totalMB = (totalBytes / 1024 / 1024).toFixed(2);
  if (totalBytes > MAX_JS_BYTES) {
    console.error(
      `[check-bundle-size] FAIL: Main JS bundle is ${totalMB} MB (limit: 3.5 MB)`,
    );
    process.exit(1);
  }
  console.log(`[check-bundle-size] OK: Main JS bundle is ${totalMB} MB`);
} catch (err) {
  console.error("[check-bundle-size] Error:", err.message);
  process.exit(1);
}
