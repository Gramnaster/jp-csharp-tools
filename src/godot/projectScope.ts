import { existsSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

/**
 * Walks up from `startDir` toward `stopDir` (inclusive), returning true if
 * any directory in that chain contains `project.godot`. Without `stopDir`
 * (a document opened outside any workspace folder) it walks to the
 * filesystem root instead — either way this is a handful of `existsSync`
 * stats, so there's no need to cap the traversal.
 */
export function isInsideGodotProject(startDir: string, stopDir?: string): boolean {
  const stop = stopDir === undefined ? undefined : normalize(stopDir);
  let current = normalize(startDir);

  for (;;) {
    if (existsSync(join(current, "project.godot"))) {
      return true;
    }
    if (stop !== undefined && current === stop) {
      return false;
    }
    const parent = dirname(current);
    if (parent === current) {
      return false;
    }
    current = parent;
  }
}
