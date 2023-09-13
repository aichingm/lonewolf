export default class Settings {

    public darkMode = false

    public static from(obj: Partial<Settings>): Settings{
        const s = new Settings()
        s.darkMode = obj.darkMode as boolean
        return s
    }

}

export interface Storage {
    load(): Promise<Settings>;
    save(settings: Settings): Promise<void>;

}

