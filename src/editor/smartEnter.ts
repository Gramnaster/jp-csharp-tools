import * as vscode from "vscode";
import { detectBlockOpener } from "../csharp/blockOpener.js";

const MAX_PRECEDING_LINES = 10;

function collectPrecedingLines(document: vscode.TextDocument, fromLine: number): string[] {
  const lines: string[] = [];
  for (let i = fromLine - 1; i >= 0 && lines.length < MAX_PRECEDING_LINES; i--) {
    lines.push(document.lineAt(i).text);
  }
  return lines;
}

/**
 * Shift+Enter handler: opens an Allman block below a C# declaration, or
 * falls back to VSCode's own "insert line below" for everything else.
 * Multi-cursor sessions always fall back — snippet insertion across
 * multiple cursors is not worth the added complexity for this command.
 */
export async function runSmartEnter(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selections.length > 1) {
    await vscode.commands.executeCommand("editor.action.insertLineAfter");
    return;
  }

  const cursorLine = editor.selection.active.line;
  const currentLineText = editor.document.lineAt(cursorLine).text;
  const precedingLines = collectPrecedingLines(editor.document, cursorLine);

  const match = detectBlockOpener(currentLineText, precedingLines);
  if (!match) {
    await vscode.commands.executeCommand("editor.action.insertLineAfter");
    return;
  }

  const lineEnd = editor.document.lineAt(cursorLine).range.end;
  await editor.insertSnippet(new vscode.SnippetString("\n{\n\t$0\n}"), lineEnd);
}
