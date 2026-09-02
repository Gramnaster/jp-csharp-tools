import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseGodotSnippets } from "../src/godot/snippetLoader.js";

describe("parseGodotSnippets", () => {
  it("joins an array body into a multi-line string", () => {
    const [snippet] = parseGodotSnippets(`{
      // a leading comment
      "Godot _Ready()": {
        "prefix": "ready",
        "body": ["public override void _Ready()", "{", "    $1", "}"],
        "description": "Godot _Ready() virtual method"
      },
    }`);

    assert.ok(snippet);
    assert.equal(snippet.prefix, "ready");
    assert.equal(snippet.body, "public override void _Ready()\n{\n    $1\n}");
    assert.equal(snippet.description, "Godot _Ready() virtual method");
  });

  it("keeps a single-line string body as-is and tolerates a missing description", () => {
    const [snippet] = parseGodotSnippets(`{
      "Godot print": {
        "prefix": "gdpr",
        "body": "GD.Print($1);"
      }
    }`);

    assert.ok(snippet);
    assert.equal(snippet.body, "GD.Print($1);");
    assert.equal(snippet.description, undefined);
  });

  it("parses the real snippets/godot.code-snippets file", () => {
    const jsonc = readFileSync(
      join(__dirname, "..", "..", "snippets", "godot.code-snippets"),
      "utf8",
    );
    const snippets = parseGodotSnippets(jsonc);
    assert.ok(snippets.length > 0);
    assert.ok(snippets.every((s) => typeof s.prefix === "string" && s.prefix.length > 0));
  });
});
