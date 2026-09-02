import * as vscode from "vscode";
import { readFileSync } from "node:fs";
import { runSmartEnter } from "./editor/smartEnter.js";
import { createGodotSnippetProvider } from "./godot/godotSnippetProvider.js";
import { parseGodotSnippets } from "./godot/snippetLoader.js";

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("jpCsharpTools.smartEnter", runSmartEnter),
  );

  const snippetsPath = context.asAbsolutePath("snippets/godot.code-snippets");
  const snippets = parseGodotSnippets(readFileSync(snippetsPath, "utf8"));
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { language: "csharp" },
      createGodotSnippetProvider(snippets),
    ),
  );
}

export function deactivate(): void {
  // Nothing to clean up: the command disposable is owned by context.subscriptions.
}
