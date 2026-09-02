import * as vscode from "vscode";
import { dirname } from "node:path";
import { isInsideGodotProject } from "./projectScope.js";
import type { GodotSnippet } from "./snippetLoader.js";

function toCompletionItem(snippet: GodotSnippet): vscode.CompletionItem {
  const item = new vscode.CompletionItem(snippet.prefix, vscode.CompletionItemKind.Snippet);
  item.insertText = new vscode.SnippetString(snippet.body);
  if (snippet.description !== undefined) {
    item.detail = snippet.description;
  }
  return item;
}

/**
 * Offers the Godot lifecycle/export snippets only inside a Godot project
 * directory (one containing `project.godot`, walked up from the open file
 * to its workspace folder root). A solution can mix a Godot project with
 * plain .csproj-only projects side by side, and the latter shouldn't see
 * Godot-specific prefixes like `ready` or `export`.
 */
export function createGodotSnippetProvider(
  snippets: readonly GodotSnippet[],
): vscode.CompletionItemProvider {
  return {
    provideCompletionItems(document: vscode.TextDocument): vscode.CompletionItem[] | undefined {
      if (document.uri.scheme !== "file") {
        return undefined;
      }

      const workspaceRoot = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;
      if (!isInsideGodotProject(dirname(document.uri.fsPath), workspaceRoot)) {
        return undefined;
      }

      return snippets.map(toCompletionItem);
    },
  };
}
