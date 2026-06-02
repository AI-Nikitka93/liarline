import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export function loadLocalEnv(filePath = path.join(process.cwd(), ".env.local")) {
  if (!existsSync(filePath)) return { loaded: false, keys: [] };

  const keys = [];
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(trimmed);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    const value = rawValue.replace(/^['"]|['"]$/g, "").trim();
    if (!value) continue;

    process.env[key] = value;
    keys.push(key);
  }

  return { loaded: true, keys };
}
