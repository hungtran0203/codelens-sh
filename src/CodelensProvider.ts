import * as vscode from 'vscode';
import { CodeLenCommandsMap } from './types';

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {

	private codeLenses: vscode.CodeLens[] = [];
	private regex: RegExp;
	private rules: CodeLenCommandsMap;
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor(rules: CodeLenCommandsMap) {
		this.regex = /(.+)/g;
		this.rules = rules;

		vscode.workspace.onDidChangeConfiguration((_) => {
			this._onDidChangeCodeLenses.fire();
		});
	}

	public provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
		if (vscode.workspace.getConfiguration("codelens-sh").get("enableCodeLens", true)) {
			this.codeLenses = [];
			const regex = new RegExp(this.regex);
			const text = document.getText();
			let matches;
			console.log(this.rules);
			while ((matches = regex.exec(text)) !== null) {
				const line = document.lineAt(document.positionAt(matches.index).line);
				const indexOf = line.text.indexOf(matches[0]);
				const position = new vscode.Position(line.lineNumber, indexOf);
				const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));
				if (range) {
					const codeLens = new vscode.CodeLens(range);
					const ctx = {
						vscode,
						document,
						line,
					};
					codeLens.command = {
						title: "Run in Terminal",
						tooltip: "Run command in integrated terminal",
						command: "codelens-sh.codelensAction",
						arguments: [`shell`, ctx]
					};
					this.codeLenses.push(codeLens);
				}
			}
			return this.codeLenses;
		}
		return [];
	}

	public resolveCodeLens(codeLens: vscode.CodeLens, _token: vscode.CancellationToken) {
		if (vscode.workspace.getConfiguration("codelens-sh").get("enableCodeLens", true)) {
			return codeLens;
		}
		return null;
	}
}

