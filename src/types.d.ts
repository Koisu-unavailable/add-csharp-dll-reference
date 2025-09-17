interface CsProjFile{
    Project: CsProject
}
interface CsProject{
    ItemGroup: any[] | dllReference[]
}
interface dllReference{
    Reference: Refernce
    "a_Include": string 
}
interface Refernce{
    HintPath: string
}
