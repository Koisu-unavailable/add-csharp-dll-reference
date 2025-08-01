export enum Locales{
    en
}
let en = {
    "INVALID_CSPROJ_FILE": "Invalid csproj file, err: "
}
export type valid_message_key = "INVALID_CSPROJ_FILE"

export function get_message(key: valid_message_key, locale: Locales) : string{
    switch (locale){
        case Locales.en:
            return en["INVALID_CSPROJ_FILE"];
    }
    return key;
}