import * as vscode from 'vscode'

export function convertPathsToInputBoxOptions(paths: string[]): vscode.InputBoxOptions {
	let options: vscode.InputBoxOptions = {};
	options.title = "Select a project";
	options.placeHolder = paths[0];
	paths.forEach(path => {
		options.value = path
	});
	return options;
}