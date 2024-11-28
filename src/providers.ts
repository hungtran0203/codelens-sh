import * as vscode from 'vscode';
import { CtxInterface, CodeLenCommandsMap } from "./types";

const _ = require('lodash');
const bashParser = require('bash-parser');

const codelenCommands: CodeLenCommandsMap = {
	provide_shell: function(ctx: CtxInterface) {
		const { document, provider } = ctx;
		if(['shellscript'].includes(document.languageId)) {
			const text = document.getText();
			const ast = bashParser(text, { insertLOC: true });
			for(const command of ast.commands) {
				const lineNumberStart = _.get(command, 'loc.start.row') - 1;
				const lineNumberEnd = _.get(command, 'loc.end.row') - 1;
				const startLine = document.lineAt(lineNumberStart);
				const endLine = document.lineAt(lineNumberEnd);
				const range = new vscode.Range(startLine.range.start, endLine.range.end);
				const codeLens = new vscode.CodeLens(range);
				const ctx = {
					vscode,
					document,
					range,
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
	},

	provide_npm: function(ctx: CtxInterface) {
		const { document, provider } = ctx;
		if(['json'].includes(document.languageId)) {
			const text = document.getText();
			const dataJson = JSON.parse(text);
			const scripts = dataJson.scripts;
			if(scripts) {
				for(const key in scripts) {
					const linePosition = document.positionAt(text.indexOf(`"${key}": `));
					const startLine = document.lineAt(linePosition.line);
					const range = startLine.range;
					if (range) {
						const codeLens = new vscode.CodeLens(range);
						const ctx = {
							vscode,
							document,
							range,
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
