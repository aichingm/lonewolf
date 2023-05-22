import NamedIdentifiable from "./NamedIdentifiable";


export default class Indexable extends NamedIdentifiable {
    private _position: number;

    constructor(id: string, name: string, position: number) {
        super(id, name)
        this._position = position;
    }

    public get position() {
        return this._position;
    }

    public set position(position: number) {
        this._position = position;
    }
}
