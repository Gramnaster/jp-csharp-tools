import { findMatchingOpenParen, joinUntilParensBalance } from "../text/lineScanner.js";

export interface NormalizedLine {
  /** Comment stripped, both ends trimmed. */
  readonly text: string;
  /** Preceding physical lines, nearest first — for multi-line parameter lists. */
  readonly precedingLines: readonly string[];
}

export interface BlockRule {
  readonly id: string;
  /** Why this rule exists. Surfaced in test names and debug output. */
  readonly intent: string;
  matches(line: NormalizedLine): boolean;
}

const BARE_KEYWORD = /^(else|try|catch|finally|do|unsafe|checked|unchecked|get|set|init)$/;

const bareKeywordRule: BlockRule = {
  id: "bare-keyword",
  intent: "A keyword that always introduces a block on its own, e.g. `else`, `try`, `get`.",
  matches: (line) => BARE_KEYWORD.test(line.text),
};

const CONTROL_FLOW_HEAD =
  /^(else\s+)?(if|for|foreach|while|switch|lock|using|fixed|catch)\s*\(/;

const controlFlowRule: BlockRule = {
  id: "control-flow",
  intent: "A control-flow statement with a parenthesized condition, e.g. `if (hp > 0)`.",
  matches: (line) => CONTROL_FLOW_HEAD.test(line.text) && line.text.endsWith(")"),
};

const TYPE_DECLARATION = /\b(class|struct|interface|enum|record|namespace)\b/;

const typeDeclarationRule: BlockRule = {
  id: "type-declaration",
  intent: "A class/struct/interface/enum/record/namespace declaration.",
  matches: (line) => TYPE_DECLARATION.test(line.text),
};

const TRAILING_WHERE_CONSTRAINT = /\s+where\s+[\w\s,.<>:()?[\]]+$/;
const MEMBER_HEAD = /^[\w\s<>[\],.?@]+$/;

/**
 * Accepts a method/constructor/local-function signature; rejects a call
 * statement merely missing its semicolon (e.g. `Console.WriteLine("hi")`).
 * The discriminator is step 5: a call's head is a single dotted token
 * (`Console.WriteLine`), while a declaration's head is always two or more
 * whitespace-separated tokens (`public static void Display`, `void Local`,
 * `public Player`).
 */
const memberDeclarationRule: BlockRule = {
  id: "member-declaration",
  intent: "A method, constructor, or local-function signature.",
  matches: (line) => {
    const withoutConstraint = line.text.replace(TRAILING_WHERE_CONSTRAINT, "");
    if (!withoutConstraint.endsWith(")")) {
      return false;
    }

    const joined = joinUntilParensBalance(withoutConstraint, line.precedingLines);
    const openParenIndex = findMatchingOpenParen(joined);
    if (openParenIndex === -1) {
      return false;
    }

    const head = joined.slice(0, openParenIndex).trim();
    if (!MEMBER_HEAD.test(head)) {
      return false;
    }

    return head.split(/\s+/).length >= 2;
  },
};

export const BLOCK_RULES: readonly BlockRule[] = [
  bareKeywordRule,
  controlFlowRule,
  typeDeclarationRule,
  memberDeclarationRule,
];
