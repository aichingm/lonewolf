import Preferences from '@/common/settings/Preferences'
import type { Storage as ProjectStorage } from "@/common/settings/Preferences";

export default class Storage implements ProjectStorage {
    private _localstorageKey = "preferences_"

    public load(projectId: string): Promise<Preferences>{
        return new Promise<Preferences>((res, _rej) => {
            this.exists(projectId).then(()=>{
                const settings = Preferences.from(JSON.parse(localStorage.getItem(this._localstorageKey + projectId) as string))
                res(settings)
            }).catch((_e)=>res(new Preferences()))
        })
    }

    public save(projectId: string, settings: Preferences): Promise<void>{
        return new Promise<void>((res, _rej) => {
            const dataStr = JSON.stringify(settings)
            localStorage.setItem(this._localstorageKey + projectId, dataStr)
            res()
        })
    }

    private exists(projectId: string): Promise<void> {
        return new Promise<void>((res, rej)=>{
            const data = localStorage.getItem(this._localstorageKey + projectId)
            if (data != null && data.length > 0) {
                res()
            } else {
                rej()
            }
        })
    }
}

