import { stripTrailingComment } from "../text/lineScanner.js";
import { BLOCK_RULES, type NormalizedLine } from "./blockRules.js";

export interface BlockOpenerMatch {
  readonly ruleId: string;
}

const ENDS_WITHOUT_BLOCK = /[;{},]$/;
const STARTS_AS_NON_CODE = /^(\/\/|\/\*|\*|#)/;

/**
 * Most exclusions fall out of this bail for free: `using System;` and
 * file-scoped `namespace Jp.Tools;` end with `;`; a do-while's
 * `while (cond);` ends with `;`; a multi-line base-list continuation ending
 * in `,` bails. Anything already terminated, empty, or non-code never
 * reaches the rule table.
 */
function isTriviallyNotABlockOpener(text: string): boolean {
  return text.length === 0 || ENDS_WITHOUT_BLOCK.test(text) || STARTS_AS_NON_CODE.test(text);
}

/**
 * Determines whether `line` (with `precedingLines`, nearest first, for
 * multi-line signatures) opens a C# block. Returns the id of the first
 * matching rule, or `null` if none match — callers that need to distinguish
 * "which rule fired" (tests) get that for free instead of a bare boolean.
 */
export function detectBlockOpener(
  line: string,
  precedingLines: readonly string[] = [],
): BlockOpenerMatch | null {
  const text = stripTrailingComment(line).trim();
  if (isTriviallyNotABlockOpener(text)) {
    return null;
  }

  const normalized: NormalizedLine = {
    text,
    precedingLines: precedingLines.map((p) => stripTrailingComment(p).trim()),
  };

  const rule = BLOCK_RULES.find((r) => r.matches(normalized));
  return rule ? { ruleId: rule.id } : null;
}
