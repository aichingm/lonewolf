export default class Card {
    private _id: string;
    private _title: string;
    private _position: number;

    constructor(id: string, title: string) {
        this._id = id;
        this._title = title;
        this._position = -1;
    }

    public get id() {
        return this._id;
    }

    public set id(id: string) {
        this._id = id;
    }

    public get title() {
        return this._title;
    }

    public set title(title: string) {
        this._title = title;
    }

    public get position() {
        return this._position;
    }

    public set position(position: number) {
        this._position = position;
    }
}
