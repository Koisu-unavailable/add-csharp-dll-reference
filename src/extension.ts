import * as vscode from 'vscode';
import * as fsUtils from './fsUtils';
import * as fs from 'fs';
import {XMLBuilder, XMLParser, XMLValidator} from 'fast-xml-parser';
import { readAssemblyName } from './dllUtils';

export function activate(context: vscode.ExtensionContext) {

	
	console.log('Congratulations, your extension "add-csharp-dll-reference" is now active!');

	// The command has been defined in the package.json file
	const disposable = vscode.commands.registerCommand('add-csharp-dll-reference.addDllReference', (uri: vscode.Uri) => {
		if (uri === null) {
			// idk
		}
		else {
			addDllReferenceForDll(uri).then(() => vscode.window.showInformationMessage("Added dll reference."));
			
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
	let assemblyName = readAssemblyName(dllPath);
	if (assemblyName === undefined || assemblyName === ""){
		vscode.window.showErrorMessage("No assembly name");
		return false;
	}
	let csProjXmlText = fs.readFileSync(csProjFilepath, { encoding: 'utf8', flag: 'r' });
	const opts = {
		ignoreAttributes: false,
        attributeNamePrefix : "a_"
	};
	let parser = new XMLParser(opts);
	let builder = new XMLBuilder(opts);
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
	const newXML = builder.build(parsed);
	fs.writeFileSync(csProjFilepath, newXML);
	return true;
}

function addReferenceToCsProjFileObject(csProjFile: CsProjFile, dllPath: string, assemblyName: string) : CsProjFile{
	csProjFile.Project.ItemGroup = 
	csProjFile.Project.ItemGroup === undefined ? [] : csProjFile.Project.ItemGroup; // if it's undefined, define it as a list
	csProjFile.Project.ItemGroup = 
	typeof(csProjFile.Project.ItemGroup) !== typeof([]) ? [csProjFile.Project.ItemGroup] : csProjFile.Project.ItemGroup; // make it a list if it isn't
	const reference: dllReference = {
		a_Include: assemblyName,
		Reference: {HintPath: dllPath}
	};
	csProjFile.Project.ItemGroup.push(reference);
	return csProjFile;
}

// This method is called when your extension is deactivated
export function deactivate() { }
