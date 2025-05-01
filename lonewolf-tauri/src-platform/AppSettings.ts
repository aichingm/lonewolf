import Settings from '@/common/settings/AppSettings'
import type { Keymap } from '@/common/settings/AppSettings'
import type { Storage as ApplicationStorage } from "@/common/settings/AppSettings";

import { LazyStore } from "@tauri-apps/plugin-store";


export default class Storage implements ApplicationStorage{
    private store = new LazyStore(".appSettings.json");

    public load(): Promise<Settings>{
        return new Promise<Settings>((res, _rej) => {
            this.exists().then(()=>{
                this.store.get("appSettings").then(s=>res(Settings.from(s as Partial<Settings>))).catch(_e=>res(new Settings()))
            }).catch((_e)=>{
                res(new Settings())
            })
        })
    }

    public save(settings: Settings): Promise<void>{
        return new Promise<void>((res, rej) => {
            this.store.set("appSettings", settings).then(()=>res()).catch(e=>rej(e));
        })
    }

    private exists(): Promise<void> {
        return new Promise<void>((res, rej)=>{
            this.store.has("appSettings").then(exists=>exists?res():rej())
        })
    }
}

export const defaultKeymap: Keymap = {
    "save": { name:"save", label: "Save", keys: "Ctrl+s"},
    "save-as": { name:"save-as", label: "Save as", keys: "Shift+Ctrl+s"},
    "new": { name:"new", label: "New", keys: "Ctrl+n"},
    "open": { name:"open", label: "Open", keys: "Ctrl+o"},
}
