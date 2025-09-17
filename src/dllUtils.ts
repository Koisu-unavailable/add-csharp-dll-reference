import * as edge from "electron-edge-js";
import * as vscode from "vscode"
export function readAssemblyName(path: string): string | undefined {
    let getAssemblyName = edge.func(`
        async (input) => {
            var name = System.Reflection.AssemblyName.GetAssemblyName((string)input).Name;
            return name;
        }`);
    let name : string | undefined = "";
    let doContinue = false;
    getAssemblyName(path, function (error, result){
        if (error) {
            vscode.window.showErrorMessage("Couldn't read assembly name from file, make sure it's a valid assembly");
            console.error(error);
            const placeHolder = "Assembly Name";
            vscode.window.showInputBox({
                placeHolder: placeHolder,
                valueSelection: [0, placeHolder.length]
            }).then((value) => {name = value; doContinue = true;}, (reason) => {doContinue = true; return true;});
        }
        else{
            name = result as string;
        }
    });
    while (!doContinue){

    }
    return name;
}
