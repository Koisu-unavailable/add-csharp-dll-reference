// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fsUtils from './fsUtils'
import * as fs from 'fs'
import {XMLBuilder, XMLParser, XMLValidator} from 'fast-xml-parser';
import { get_message, Locales } from './i18n';
import { readAssemblyName } from './dllUtils';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "add-csharp-dll-reference" is ndfbdfsgdfsow active!');

	// The command has been defined in the package.json file
	const disposable = vscode.commands.registerCommand('add-csharp-dll-reference.addDllReference', (uri: vscode.Uri) => {
		if (uri === null) {
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
		if (error.cause === askUserForCsProjFile){
			vscode.window.showErrorMessage(`Could not find the workspace folder that contains ${uri.fsPath}`);
		}
		else{
			vscode.window.showErrorMessage(error.message);
		}
		return;
	}
	if (csProjFile === undefined){
		vscode.window.showErrorMessage("No csproj file selected. Aborting.");
		return;
	}
	addDllReferenceToCsProjFile(csProjFile, uri.fsPath);

}
async function askUserForCsProjFile(uri: vscode.Uri) : Promise<string | undefined> {
	let currentFolderPath = vscode.workspace.getWorkspaceFolder(uri)?.name;
	if (currentFolderPath === undefined) {
		let error = Error("Couldn't find current workspace folder");
		error.name = "Dir not found";
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
	let assemblyName = readAssemblyName();
	let csProjXmlText = fs.readFileSync(csProjFilepath, { encoding: 'utf8', flag: 'r' });
	let parser = new XMLParser();
	let builder = new XMLBuilder();
	let validationResult = XMLValidator.validate(csProjXmlText);
	if (validationResult !== true){
		vscode.window.showErrorMessage("Invalid csproj file, err:" + validationResult.err.msg);
		return false;
	}
	let parsed : CsProjFile = parser.parse(csProjXmlText);
	if (parsed.Project === undefined){
		vscode.window.showErrorMessage("Invalid csproj profile, err: "+ "No project tag found");
	}
	parsed = addReferenceToCsProjFileObject(parsed, dllPath, assemblyName);
	return true;
}

function addReferenceToCsProjFileObject(csProjFile: CsProjFile, dllPath: string, assemblyName: string) : CsProjFile{
	csProjFile.Project.ItemGroup = 
	csProjFile.Project.ItemGroup === undefined ? [] : csProjFile.Project.ItemGroup; // if it's undefined, define it as a list
	csProjFile.Project.ItemGroup = 
	typeof(csProjFile.Project.ItemGroup) !== typeof([]) ? [csProjFile.Project.ItemGroup] : csProjFile.Project.ItemGroup; // make it a list if it isn't
	csProjFile.Project.ItemGroup.push();
	
	return csProjFile;
}

// This method is called when your extension is deactivated
export function deactivate() { }
