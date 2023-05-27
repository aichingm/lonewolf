
import { ProjectStorage } from '@platform/ProjectStorage'

export enum Platforms{
    Browser = "browser",
    Tauri = "tauri",
}

export function currrentPlatform(): string{
    return import.meta.env.VITE_PLATFORM
}


export function projectStorage(): ProjectStorage {
    return new ProjectStorage()
}
