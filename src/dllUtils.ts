import * as edge from "electron-edge-js";
import * as vscode from "vscode"
export function readAssemblyName(path: string): string | undefined {
    let getAssemblyName = edge.func(`
        async (input) => {
            var name = System.Reflection.AssemblyName.GetAssemblyName((string)input).Name;
            return name;
        }`);
    let name : string | undefined = "";
    getAssemblyName(path, function (error, result){
        if (error) {
            vscode.window.showErrorMessage("Couldn't read assembly name from file, make sure it's a valid assembly");
            console.error('add-csharp-dll-reference ERROR: ' + error);
        }
        else{
            name = result as string;
        }
    });
    return name;
}
