import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectBlockOpener } from "../src/csharp/blockOpener.js";

function assertRule(line: string, expectedRuleId: string, precedingLines: string[] = []): void {
  const match = detectBlockOpener(line, precedingLines);
  assert.ok(match, `expected "${line}" to match rule "${expectedRuleId}", got no match`);
  assert.equal(match.ruleId, expectedRuleId);
}

function assertNoMatch(line: string, precedingLines: string[] = []): void {
  assert.equal(detectBlockOpener(line, precedingLines), null, `expected "${line}" to fall through`);
}

describe("member-declaration", () => {
  it("matches a static method signature", () => {
    assertRule("public static void Display()", "member-declaration");
  });

  it("matches an async method with a generic return type", () => {
    assertRule("private async Task<int> Fetch(string url)", "member-declaration");
  });

  it("matches a constructor with an accessibility modifier", () => {
    assertRule("public Player(int hp)", "member-declaration");
  });

  it("matches a local function", () => {
    assertRule("void Local(int x)", "member-declaration");
  });

  it("matches a multi-line parameter list via preceding lines", () => {
    assertRule("int b)", "member-declaration", ["public static void Add(int a,"]);
  });
});

describe("type-declaration", () => {
  it("matches a class with a base list", () => {
    assertRule("public class Player : Entity, IDamageable", "type-declaration");
  });

  it("matches a generic class with a where constraint", () => {
    assertRule("public class Repo<T> where T : class", "type-declaration");
  });

  it("matches a block-scoped namespace", () => {
    assertRule("namespace Jp.Tools", "type-declaration");
  });
});

describe("control-flow", () => {
  it("matches if", () => {
    assertRule("if (hp > 0)", "control-flow");
  });

  it("matches foreach", () => {
    assertRule("foreach (var e in enemies)", "control-flow");
  });

  it("matches using", () => {
    assertRule("using (var s = new MemoryStream())", "control-flow");
  });
});

describe("bare-keyword", () => {
  it("matches else", () => {
    assertRule("else", "bare-keyword");
  });

  it("matches try", () => {
    assertRule("try", "bare-keyword");
  });

  it("matches a bare catch with no exception filter", () => {
    assertRule("catch", "bare-keyword");
  });

  it("matches a property accessor", () => {
    assertRule("get", "bare-keyword");
  });
});

describe("fallback (no match)", () => {
  it("rejects a statement ending in a semicolon", () => {
    assertNoMatch("var x = Compute();");
  });

  it("rejects a call statement missing its semicolon", () => {
    assertNoMatch('Console.WriteLine("hi")');
  });

  it("rejects an expression-bodied property", () => {
    assertNoMatch("public int X => 5;");
  });

  it("rejects a file-scoped namespace", () => {
    assertNoMatch("namespace Jp.Tools;");
  });

  it("rejects a using directive", () => {
    assertNoMatch("using System;");
  });

  it("rejects an attribute", () => {
    assertNoMatch('[HttpGet("/api")]');
  });

  it("rejects a comment", () => {
    assertNoMatch("// a comment");
  });

  it("rejects an empty line", () => {
    assertNoMatch("");
  });

  it("rejects a do-while trailer", () => {
    assertNoMatch("while (cond);");
  });
});
