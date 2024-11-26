import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, languages, commands, Disposable, workspace } from 'vscode';
import { CodelensProvider } from './CodelensProvider';
import { CodeLenCommandsMap, CtxInterface } from './types';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let disposables: Disposable[] = [];

const FJS_EXTENSION = 'fjs';

function findFjsFiles(directory: string, prefix: string) {
	if (!fs.existsSync(directory)) {
		return [];
	}
	const files = fs.readdirSync(directory);
	const fjsFiles = files.filter(file => {
		const basename = path.basename(file, `.${FJS_EXTENSION}`);
		return path.extname(file) === `.${FJS_EXTENSION}` && (!prefix || basename.startsWith(prefix));
});

const rtn = [];
for (const file of fjsFiles) {
		const filePath = path.resolve(directory, file);
		rtn.push(filePath);
}
return rtn;
}

function loadRules(context: ExtensionContext) {
	const rulesFiles = [
		...findFjsFiles(context.extensionPath, 'rules'),
		...findFjsFiles(path.join(context.extensionPath, FJS_EXTENSION), 'rules'),
	];
	const rules: CodeLenCommandsMap = {};

	rulesFiles.forEach((rulesFile) => {
		try {
			const rulesMod = require(rulesFile);

			Object.keys(rulesMod).forEach((key) => {
				const ruleFn = rulesMod[key];
				rules[key] = ruleFn;
			});	
		} catch (err) {
			console.log('error loading rules', err);
		}
	});
	return rules;
}

export function activate(context: ExtensionContext) {
	const rules = loadRules(context);
	const codelenCommands: CodeLenCommandsMap = {
		shell: function(ctx: CtxInterface) {
			const { line } = ctx;
			const terminal = selectTerminal();
			if (terminal) {
				terminal.show(true);
				terminal.sendText(line.text);
			}
		},
		...rules,
	};
	const codelensProvider = new CodelensProvider(rules);

	languages.registerCodeLensProvider("*", codelensProvider);

	commands.registerCommand("codelens-sh.enableCodeLens", () => {
		workspace.getConfiguration("codelens-sh").update("enableCodeLens", true, true);
	});

	commands.registerCommand("codelens-sh.disableCodeLens", () => {
		workspace.getConfiguration("codelens-sh").update("enableCodeLens", false, true);
	});

	commands.registerCommand("codelens-sh.codelensAction", (cmdType: string, ctx: CtxInterface) => {
		const cmdExecutor = codelenCommands[cmdType];
		if(cmdExecutor) {
			cmdExecutor(ctx);
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (disposables) {
		disposables.forEach(item => item.dispose());
	}
	disposables = [];
}

let NEXT_TERM_ID = 1;

function selectTerminal(): vscode.Terminal {
	if (vscode.window.terminals.length === 0) {
		return vscode.window.createTerminal(`codelens #${NEXT_TERM_ID++}`);
	}
	const terminals = vscode.window.terminals;
	return terminals[0];
}

