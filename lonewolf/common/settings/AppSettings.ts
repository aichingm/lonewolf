
import { defaultKeymap } from "@/platform/Functions"
type Keybinding = {name:string, label: string, keys: string}
export type Keymap = { [index: string]: Keybinding }

export default class Settings {

    public darkMode = false
    public keymap: Keymap = structuredClone(defaultKeymap())


    public static from(obj: Partial<Settings>): Settings{
        const s = new Settings()
        s.darkMode = obj.darkMode as boolean
        Object.assign(s.keymap, obj.keymap)
        return s
    }

}

export interface Storage {
    load(): Promise<Settings>;
    save(settings: Settings): Promise<void>;

}

