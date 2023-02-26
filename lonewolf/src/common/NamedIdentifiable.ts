
export default class NamedIdentifiable{
    private _id: string;
    public name: string;

    constructor(id: string, name: string) {
        this._id = id;
        this.name = name;
    }

    public get id(): string {
        return this._id;
    }

    public set id(id: string) {
        this._id = id;
    }

}
