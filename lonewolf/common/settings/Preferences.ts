
export default class Settings {

    public boardListsJustification = "left"
    public boardListsWidth = 200
    public projectAutoSave = false

    public static from(obj: Partial<Settings>): Settings{
        const s = new Settings()
        s.boardListsJustification = obj.boardListsJustification as string || "left"
        s.boardListsWidth = obj.boardListsWidth as number || 200
        s.projectAutoSave = obj.projectAutoSave as boolean || false
        return s
    }

}

export interface Storage {
    load(projectId: string): Promise<Settings>;
    save(projectId: string, settings: Settings): Promise<void>;

}



