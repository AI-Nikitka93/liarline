import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const statePath = path.join(root, "docs", "STATE.md");
const outPath = path.join(root, "docs", "state.json");

function parseStateBlock(markdown) {
  const match = markdown.match(/```state\s*([\s\S]*?)```/);
  if (!match) {
    throw new Error("STATE.md does not contain a ```state block.");
  }

  const state = {};
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      state[key] = JSON.parse(value.replaceAll("'", '"'));
    } else {
      state[key] = value;
    }
  }

  for (const required of [
    "current_goal",
    "current_task",
    "status",
    "active_step",
    "next_step",
    "blockers",
    "artifacts",
    "updated_at"
  ]) {
    if (!(required in state)) {
      throw new Error(`Missing state field: ${required}`);
    }
  }

  return state;
}

const markdown = await readFile(statePath, "utf8");
const state = parseStateBlock(markdown);
await writeFile(outPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
console.log(`Generated ${outPath}`);

