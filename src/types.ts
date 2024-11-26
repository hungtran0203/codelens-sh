import * as vscode from 'vscode';

// tslint:disable-next-line: interface-name
export type CodeLenCommandsMap = {
	[key: string]: (ctx: CtxInterface) => void;
};

export interface CtxInterface {
	document: vscode.TextDocument;
	line: vscode.TextLine;
};
