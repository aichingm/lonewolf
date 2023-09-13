
export default class Settings {

    public boardListsJustification = "left"
    public boardListsWidth = 200

    public static from(obj: Partial<Settings>): Settings{
        const s = new Settings()
        s.boardListsJustification = obj.boardListsJustification as string || "left"
        s.boardListsWidth = obj.boardListsWidth as number || 200
        return s
    }

}

export interface Storage {
    load(projectId: string): Promise<Settings>;
    save(projectId: string, settings: Settings): Promise<void>;

}



