import * as vscode from 'vscode';
import * as fsUtils from './fsUtils';
import * as fs from 'fs';
import { XMLBuilder, XMLParser, XMLValidator } from 'fast-xml-parser';
import { readAssemblyName } from './dllUtils';
import { resolve } from 'path';

export function activate(context: vscode.ExtensionContext) {


	console.log('add-csharp-dll-reference has been activated.');

	// The command has been defined in the package.json file
	const disposable = vscode.commands.registerCommand('add-csharp-dll-reference.addDllReference', (uri: vscode.Uri) => {
		if (uri === null || uri === undefined) {
			vscode.window.showInformationMessage("Please right-click a dll file");
			return;
		}
		else {
			addDllReferenceForDll(uri).then((result) => result ? vscode.window.showInformationMessage("Added dll reference.") : undefined);

		}
	});

	context.subscriptions.push(disposable);
}
async function addDllReferenceForDll(uri: vscode.Uri): Promise<boolean> {
	vscode.window.showInformationMessage(`Adding a dll reference for ${uri.fsPath}`);
	let csProjFile;
	try {
		csProjFile = await askUserForCsProjFile(uri);
	}
	catch (error: any) {
		if (error.cause === askUserForCsProjFile) {
			vscode.window.showErrorMessage(`Could not find the workspace folder that contains ${uri.fsPath}`);
		}
		else {
			vscode.window.showErrorMessage(error.message);
		}
		return false;
	}
	if (csProjFile === undefined) {
		vscode.window.showErrorMessage("No csproj file selected. Aborting.");
		return false;
	}
	return addDllReferenceToCsProjFile(csProjFile, uri.fsPath);

}
async function askUserForCsProjFile(uri: vscode.Uri): Promise<string | undefined> {
	let currentFolderPath = vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath;
	if (currentFolderPath === undefined) {
		let error = Error("Couldn't find current workspace folder");
		error.name = "Dir not found";
		error.cause = askUserForCsProjFile;
		throw error;
	}
	currentFolderPath = resolve(currentFolderPath);
	return await vscode.window.showQuickPick(fsUtils.searchDirectoryFilesFiles(currentFolderPath, "csproj"));
}
/**
 * 
 * @param csProjFilepath 
 * @param dllPath 
 * Returns whether to continue or not, it handles it's own errors
 */
function addDllReferenceToCsProjFile(csProjFilepath: string, dllPath: string): boolean {
	let assemblyName = readAssemblyName(dllPath);
	if (assemblyName === undefined || assemblyName === "") {
		vscode.window.showErrorMessage("No assembly name");
		return false;
	}
	let csProjXmlText = fs.readFileSync(csProjFilepath, { encoding: 'utf8', flag: 'r' });
	const opts = {
		ignoreAttributes: false,
		attributeNamePrefix: "a_"
	};
	let parser = new XMLParser(opts);
	let builder = new XMLBuilder(opts);
	let validationResult = XMLValidator.validate(csProjXmlText);
	if (validationResult !== true) {
		vscode.window.showErrorMessage("Invalid csproj file, err:" + validationResult.err.msg);
		return false;
	}
	let parsed: CsProjFile = parser.parse(csProjXmlText);
	if (parsed.Project === undefined) {
		vscode.window.showErrorMessage("Invalid csproj profile, err: " + "No project tag found");
	}
	parsed = addReferenceToCsProjFileObject(parsed, dllPath, assemblyName);
	const newXML = builder.build(parsed);
	fs.writeFileSync(csProjFilepath, newXML);
	return true;
}

function addReferenceToCsProjFileObject(csProjFile: CsProjFile, dllPath: string, assemblyName: string): CsProjFile {
	csProjFile.Project.ItemGroup =
		csProjFile.Project.ItemGroup === undefined ? [] : csProjFile.Project.ItemGroup; // if it's undefined, define it as a list
	csProjFile.Project.ItemGroup =
		!Array.isArray(csProjFile.Project.ItemGroup) ? [csProjFile.Project.ItemGroup] : csProjFile.Project.ItemGroup; // make it a list if it isn't
	const reference: dllReference = {
		Reference: { HintPath: dllPath, a_Include: assemblyName }
	};
	csProjFile.Project.ItemGroup.push(reference);
	return csProjFile;
}
