
export enum Platforms{
    Browser = "browser",
    Tauri = "tauri",
}

export function currrentPlatform(): string{
    return import.meta.env.VITE_PLATFORM
}
