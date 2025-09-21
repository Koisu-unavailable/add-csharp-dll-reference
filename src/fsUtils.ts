import { resolve, sep} from 'path';
import * as fs from 'fs';

export function searchDirectoryFilesFiles(dir: string, extension: string): string[] {
    let csProjFiles = fs.readdirSync(dir, { withFileTypes: true, recursive: true })
        .filter(
            e => e.name.split(".").reverse()[0] === extension)
        .map(e => resolve(e.parentPath + sep +  e.name));
    return csProjFiles;
}

