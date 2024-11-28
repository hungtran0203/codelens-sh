import * as vscode from 'vscode';
import { CtxInterface, CodeLenCommandsMap } from "./types";

const _ = require('lodash');

let NEXT_TERM_ID = 1;

function selectTerminal(): vscode.Terminal {
	if (vscode.window.terminals.length === 0) {
		return vscode.window.createTerminal(`codelens #${NEXT_TERM_ID++}`);
	}
	const terminals = vscode.window.terminals;
	return terminals[0];
}

const codelenCommands: CodeLenCommandsMap = {
	shell: function(ctx: CtxInterface) {
		const { range } = ctx;
		const terminal = selectTerminal();
		if (terminal && range) {
			const text = ctx.document.getText(range);
			terminal.show(true);
			terminal.sendText(text);
		}
	},
	npm: function(ctx: CtxInterface) {
		const { range } = ctx;
		const terminal = selectTerminal();

		if (terminal && range) {
			terminal.show(true);
			const text = ctx.document.getText(range);
			const trimText = _.trim(_.trim(text), ',');
			const cmdObj = JSON.parse("{" + trimText + "}");
			const cmd = `npm run ${Object.keys(cmdObj)[0]}`;
			terminal.sendText(cmd);
		}
	},
};

export default codelenCommands;
