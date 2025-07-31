// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fsUtils from './fsUtils'
import * as fs from 'fs'
import fxp, { XMLParser } from 'fast-xml-parser';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "add-csharp-dll-reference" is now active!');

	// The command has been defined in the package.json file
	const disposable = vscode.commands.registerCommand('add-csharp-dll-reference.addDllReference', (uri: vscode.Uri) => {
		if (uri == null) {
			// idk
		}
		else {
			addDllReferenceForDll(uri);
		}
	});

	context.subscriptions.push(disposable);
}
async function addDllReferenceForDll(uri: vscode.Uri) {
	vscode.window.showInformationMessage(`Adding a dll reference for ${uri.fsPath}`);
	let csProjFile;
	try{
		csProjFile = await askUserForCsProjFile(uri);
	}
	catch (error: any){
		if (error.cause == askUserForCsProjFile){
			vscode.window.showErrorMessage(`Could not find the workspace folder that contains ${uri.fsPath}`);
		}
		else{
			vscode.window.showErrorMessage(error.message);
		}
		return;
	}

}
async function askUserForCsProjFile(uri: vscode.Uri) {
	let currentFolderPath = vscode.workspace.getWorkspaceFolder(uri)?.name;
	if (currentFolderPath == undefined) {
		let error = Error("Couldn't find current workspace folder");
		error.name = "Dir not found"
		error.cause = askUserForCsProjFile;
		throw error;
	}
	return await vscode.window.showQuickPick(fsUtils.getCsProjFiles(currentFolderPath))
}
/**
 * 
 * @param csProjFilepath 
 * @param dllPath 
 * Returns whether to continue or not, it handles it's own errors
 */
function addDllReferenceToCsProjFile(csProjFilepath: string, dllPath: string): boolean{
	let csProjXmlText = fs.readFileSync(csProjFilepath, { encoding: 'utf8', flag: 'r' })
	let parser = new fxp.XMLParser()
	let builder = new fxp.XMLBuilder()
	try{
		fxp.XMLValidator.validate(csProjXmlText)
	}
	catch (error){
		
	}
	
}

// This method is called when your extension is deactivated
export function deactivate() { }
