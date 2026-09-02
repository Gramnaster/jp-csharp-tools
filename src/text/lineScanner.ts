/**
 * Strips a trailing `//` line comment. Not string-literal aware: a URL like
 * `"http://x"` becomes `"http:`. This is deliberate rather than a bug — every
 * malformed result it can produce fails the block-opener rules and falls
 * through to the fallback behavior, which is correct anyway. A literal-aware
 * scanner would add real complexity to prevent a failure mode that already
 * resolves correctly.
 */
export function stripTrailingComment(line: string): string {
  const index = line.indexOf("//");
  return index === -1 ? line : line.slice(0, index);
}

/**
 * Scans backward from `text`'s final `)` to find its matching `(`, tracking
 * paren depth. Returns -1 if `text` does not end with `)` or the parens
 * never balance within `text`.
 */
export function findMatchingOpenParen(text: string): number {
  if (!text.endsWith(")")) {
    return -1;
  }

  let depth = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    const char = text[i];
    if (char === ")") {
      depth++;
    } else if (char === "(") {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

function countParenBalance(text: string): number {
  let balance = 0;
  for (const char of text) {
    if (char === "(") {
      balance++;
    } else if (char === ")") {
      balance--;
    }
  }
  return balance;
}

/**
 * Joins `line` with as many `precedingLines` (nearest first) as needed for
 * open/close parens to balance, so a multi-line parameter list reads as one
 * logical line. Stops after `maxLookback` lines even if parens never balance,
 * returning whatever was joined so far.
 */
export function joinUntilParensBalance(
  line: string,
  precedingLines: readonly string[],
  maxLookback = 10,
): string {
  let joined = line;
  let balance = countParenBalance(line);

  for (let i = 0; i < precedingLines.length && i < maxLookback && balance < 0; i++) {
    const prev = precedingLines[i];
    if (prev === undefined) {
      break;
    }
    joined = `${prev} ${joined}`;
    balance += countParenBalance(prev);
  }

  return joined;
}
