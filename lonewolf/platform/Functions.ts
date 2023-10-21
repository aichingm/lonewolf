
import { ProjectStorage } from '@platform/ProjectStorage'
import createAttachmentStorage from '@platform/AttachmentStorage'
import { extensions } from '@platform/Extensions'
import type Extension from '@/common/Extension'
import { presentAttachmentActionName as platformPresentAttachmentActionName, presentAttachment as platformPresentAttachment } from '@platform/AttachmentStorage'
import type { Store as AttachmentStorage } from '@/common/attachments/Store'
import type Board from '@/common/data/Board'
import { supportsChooseFile as platform_supportsChooseFile } from '@platform/Support'

import AppSettingsStorage, { defaultKeymap as applicationSettingsKeymap } from "@platform/AppSettings";
import PreferencesStorage from "@platform/Preferences";


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

export function applicationSettingsStorage() {
    return new AppSettingsStorage()
}

export function preferencesStorage() {
    return new PreferencesStorage()
}

export function defaultKeymap(){
    return applicationSettingsKeymap
}

export function platformCanSupportBoard(b: Board): boolean {
    if (currrentPlatform() ==  Platforms.Browser && b.attachmentStore().descriptor.storeType != "inline" && import.meta.env.VITE_IGNORE_PLATFORM_CAN_SUPPORT != "1") {
        return false
    }
    return true
}

export function defaultAttachmentStorage(): AttachmentStorage {
    return createAttachmentStorage()
}

export function presentAttachmentActionName(): string {
    return platformPresentAttachmentActionName()
}

export function presentAttachment(name: string, uri: string) {
    return platformPresentAttachment(name, uri)
}

export function platformExtensions(): Extension[] {
    return extensions()
}

/*
 * Platform Support
 */

export function supportsChooseFile():boolean {
    return platform_supportsChooseFile()
}


