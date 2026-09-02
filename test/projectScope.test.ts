import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isInsideGodotProject } from "../src/godot/projectScope.js";

function withTempDir(run: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "jp-csharp-tools-"));
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe("isInsideGodotProject", () => {
  it("finds project.godot in the starting directory", () => {
    withTempDir((root) => {
      writeFileSync(join(root, "project.godot"), "");
      assert.equal(isInsideGodotProject(root, root), true);
    });
  });

  it("finds project.godot in an ancestor, at or above the workspace root", () => {
    withTempDir((root) => {
      writeFileSync(join(root, "project.godot"), "");
      const scriptsDir = join(root, "Scripts", "Player");
      mkdirSync(scriptsDir, { recursive: true });
      assert.equal(isInsideGodotProject(scriptsDir, root), true);
    });
  });

  it("returns false when no ancestor up to the workspace root has project.godot", () => {
    withTempDir((root) => {
      const otherProjectDir = join(root, "OtherProject");
      mkdirSync(otherProjectDir, { recursive: true });
      assert.equal(isInsideGodotProject(otherProjectDir, root), false);
    });
  });

  it("does not look past the workspace root, even if an ancestor above it has project.godot", () => {
    withTempDir((root) => {
      writeFileSync(join(root, "project.godot"), "");
      const workspaceRoot = join(root, "OtherProject");
      mkdirSync(workspaceRoot, { recursive: true });
      assert.equal(isInsideGodotProject(workspaceRoot, workspaceRoot), false);
    });
  });

  it("walks to the filesystem root when no workspace root is given", () => {
    withTempDir((root) => {
      const nested = join(root, "a", "b");
      mkdirSync(nested, { recursive: true });
      assert.equal(isInsideGodotProject(nested, undefined), false);
    });
  });
});
