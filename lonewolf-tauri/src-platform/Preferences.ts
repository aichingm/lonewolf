import Preferences from '@/common/settings/Preferences'
import type { Storage as ProjectStorage } from "@/common/settings/Preferences";

import { Store } from "tauri-plugin-store-api";

export default class Storage implements ProjectStorage {
    private store = new Store(".preferences.json");

    public load(projectId: string): Promise<Preferences>{
        return new Promise<Preferences>((res, _rej) => {
            this.exists(projectId).then(()=>{
                this.store.get(projectId).then(p=>res(Preferences.from(p as Partial<Preferences>))).catch(_e=>res(new Preferences()))
            }).catch((_e)=>res(new Preferences()))
        })
    }

    public save(projectId: string, preferences: Preferences): Promise<void>{
        return new Promise<void>((res, rej) => {
            this.store.set(projectId, preferences).then(res).catch(rej);
        })
    }

    private exists(projectId: string): Promise<void> {
        return new Promise<void>((res, rej)=>{
            this.store.has(projectId).then(exists=>exists?res():rej())
        })
    }
}

