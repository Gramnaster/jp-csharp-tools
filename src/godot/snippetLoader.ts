export interface GodotSnippet {
  readonly prefix: string;
  readonly body: string;
  readonly description?: string;
}

interface RawSnippetEntry {
  readonly prefix: string;
  readonly body: string | readonly string[];
  readonly description?: string;
}

/**
 * Strips the `.code-snippets` JSONC syntax that `JSON.parse` rejects: whole-
 * line `//` comments and a trailing comma before a closing `}`/`]`. Not a
 * general JSONC parser — this project's snippet file never uses block
 * comments or a comment trailing code on the same line, and `JSON.parse`
 * throws loudly if that ever changes, so there's no silent-corruption risk
 * (same tradeoff as `stripTrailingComment` in text/lineScanner.ts).
 */
function toStrictJson(jsonc: string): string {
  const withoutLineComments = jsonc
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
  return withoutLineComments.replace(/,(\s*[}\]])/g, "$1");
}

export function parseGodotSnippets(jsonc: string): GodotSnippet[] {
  const raw = JSON.parse(toStrictJson(jsonc)) as Record<string, RawSnippetEntry>;
  return Object.values(raw).map((entry) => {
    const body = typeof entry.body === "string" ? entry.body : entry.body.join("\n");
    return entry.description === undefined
      ? { prefix: entry.prefix, body }
      : { prefix: entry.prefix, body, description: entry.description };
  });
}
