import * as vscode from 'vscode';
import { CtxInterface, CodeLenCommandsMap } from "./types";

const _ = require('lodash');
const bashParser = require('bash-parser');
const sqlParser = require('sql-parser-cst');
const mdParser = require("@textlint/markdown-to-ast").parse;

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
	},

	provide_sql: function(ctx: CtxInterface) {
		const { document, provider } = ctx;
		if(['sql'].includes(document.languageId)) {
			const text = document.getText();
			const ast = sqlParser.parse(text, {
				dialect: "sqlite",
				includeRange: true, // Adds source code location data
			});
			for(const command of ast.statements) {
				if(command.type === 'empty') {
					continue;
				}
				const startLoc = command.range[0];
				const endLoc = command.range[1];
				const startLine = document.lineAt(document.positionAt(startLoc).line);
				const endLine = document.lineAt(document.positionAt(endLoc).line);
				const range = new vscode.Range(startLine.range.start, endLine.range.end);
				if (range) {
					const codeLens = new vscode.CodeLens(range);
					const ctx = {
						vscode,
						document,
						range,
					};
					codeLens.command = {
						title: "Run SQL",
						tooltip: "Run sql statement",
						command: "codelens-sh.codelensAction",
						arguments: [`sql`, ctx]
					};
					provider?.codeLenses.push(codeLens);
				}
			}
		}
	},

	provide_md: function(ctx: CtxInterface) {
		const { document, provider } = ctx;
		if(['markdown'].includes(document.languageId)) {
			const text = document.getText();
			const ast = mdParser(text);
			const blocks = _.get(ast, 'children', []);
			for(const block of blocks) {
				if(block.type !== 'CodeBlock') {
					continue;
				}
				if(['shell', 'bash', 'sh'].includes(block.lang)) {
					const startLoc = block.range[0];
					const endLoc = block.range[1];
					const startLine = document.lineAt(document.positionAt(startLoc).line);
					const endLine = document.lineAt(document.positionAt(endLoc).line);
					const range = new vscode.Range(startLine.range.start, endLine.range.end);
					if (range) {
						const codeLens = new vscode.CodeLens(range);
						const ctx = {
							vscode,
							document,
							range,
							data: JSON.stringify(block),
						};
						codeLens.command = {
							title: "Run Shell",
							tooltip: "Run shell block",
							command: "codelens-sh.codelensAction",
							arguments: [`shellBlock`, ctx]
						};
						provider?.codeLenses.push(codeLens);
					}	
				} else if(['javascript'].includes(block.lang)) {
					const startLoc = block.range[0];
					const endLoc = block.range[1];
					const startLine = document.lineAt(document.positionAt(startLoc).line);
					const endLine = document.lineAt(document.positionAt(endLoc).line);
					const range = new vscode.Range(startLine.range.start, endLine.range.end);
					if (range) {
						const codeLens = new vscode.CodeLens(range);
						const ctx = {
							vscode,
							document,
							range,
							data: JSON.stringify(block),
						};
						codeLens.command = {
							title: "Run JS",
							tooltip: "Run js block",
							command: "codelens-sh.codelensAction",
							arguments: [`jsBlock`, ctx]
						};
						provider?.codeLenses.push(codeLens);
					}	
				}
			}
		}
	},
};

export default codelenCommands;
