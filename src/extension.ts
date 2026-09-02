import * as vscode from "vscode";
import { runSmartEnter } from "./editor/smartEnter.js";

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("jpCsharpTools.smartEnter", runSmartEnter),
  );
}

export function deactivate(): void {
  // Nothing to clean up: the command disposable is owned by context.subscriptions.
}
