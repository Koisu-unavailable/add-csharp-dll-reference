interface CsProjFile{
    Project: CsProject
}
interface CsProject{
    ItemGroup: any[] | dllReference[]
}
interface dllReference{
    Reference: Refernce
}
interface Refernce{
    HintPath: string
    a_Include : string 
}
