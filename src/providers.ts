import * as vscode from 'vscode';
import { CtxInterface, CodeLenCommandsMap } from "./types";

const _ = require('lodash');

const codelenCommands: CodeLenCommandsMap = {
	provide_shell: function(ctx: CtxInterface) {
		const { document, provider } = ctx;

		if(['shellscript'].includes(document.languageId)) {
			const regex = /(.+)/g;
			const text = document.getText();
			let matches;
			
			while ((matches = regex.exec(text)) !== null) {
				const line = document.lineAt(document.positionAt(matches.index).line);
				const indexOf = line.text.indexOf(matches[0]);
				const position = new vscode.Position(line.lineNumber, indexOf);
				const range = document.getWordRangeAtPosition(position, new RegExp(regex));
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
					provider?.codeLenses.push(codeLens);
				}
			}
		}
	},

	provide_npm: function(ctx: CtxInterface) {
		const { document, provider } = ctx;
		if(['json'].includes(document.languageId)) {
			const text = document.getText();
			const regex = /(.+)/g;
			const dataJson = JSON.parse(text);
			const scripts = dataJson.scripts;
			if(scripts) {
				console.log('scripts', _.keys(scripts));
				for(const key in scripts) {
					console.log('keykeykeykey', key, text.indexOf(key));
					const line = document.lineAt(document.positionAt(text.indexOf(key)).line);
					const indexOf = line.text.indexOf(key);
					const position = new vscode.Position(line.lineNumber, indexOf);
					const range = document.getWordRangeAtPosition(position, new RegExp(regex));
					if (range) {
						const codeLens = new vscode.CodeLens(range);
						const ctx = {
							vscode,
							document,
							line,
						};
						codeLens.command = {
							title: "Run Script",
							tooltip: "Run npm script in integrated terminal",
							command: "codelens-sh.codelensAction",
							arguments: [`npm`, ctx]
						};
						provider?.codeLenses.push(codeLens);
					}
				}
			}
		}
	}
};

export default codelenCommands;
