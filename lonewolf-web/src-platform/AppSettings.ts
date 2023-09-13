import Settings from '@/common/settings/AppSettings'
import type { Storage as ApplicationStorage } from "@/common/settings/AppSettings";

export default class Storage implements ApplicationStorage{
    private _localstorageKey = "applicationSettings"

    public load(): Promise<Settings>{
        return new Promise<Settings>((res, _rej) => {
            this.exists().then(()=>{
                const settings = Settings.from(JSON.parse(localStorage.getItem(this._localstorageKey) as string))
                res(settings)
            }).catch((_e)=>{
                res(new Settings())
            })
        })
    }

    public save(settings: Settings): Promise<void>{
        return new Promise<void>((res, _rej) => {
            const dataStr = JSON.stringify(settings)
            localStorage.setItem(this._localstorageKey, dataStr)
            res()
        })
    }

    private exists(): Promise<void> {
        return new Promise<void>((res, rej)=>{
            const data = localStorage.getItem(this._localstorageKey)
            if (data != null && data.length > 0) {
                res()
            } else {
                rej()
            }
        })
    }
}

