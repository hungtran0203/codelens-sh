import * as vscode from 'vscode';
import { CodeLenCommandsMap } from './types';

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {

	public codeLenses: vscode.CodeLens[] = [];
	private providers: CodeLenCommandsMap;
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor(providers: CodeLenCommandsMap) {
		this.providers = providers;

		vscode.workspace.onDidChangeConfiguration((_) => {
			this._onDidChangeCodeLenses.fire();
		});
	}

	public provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
		if (vscode.workspace.getConfiguration("codelens-sh").get("enableCodeLens", true)) {
			this.codeLenses = [];
			const ctx = {
				vscode,
				document,
				provider: this,
			};
			for(const key in this.providers) {
				const provider = this.providers[key];
				provider(ctx);
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

