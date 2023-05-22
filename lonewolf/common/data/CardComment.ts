import { v1 as uuid } from "uuid";
import type Board from "@/common/data/Board";



export default class CardComment {
    private _id: string;
    public content: string;
    public createdAt: number; //this is in utc ALWAYS!!! number of milliseconds elapsed since the epoch
    public deleted: boolean;


    constructor(id: string, content: string) {
        this._id = id;
        this.content = content;
        this.createdAt = Date.now()
        this.deleted = false
    }

    public get id(): string {
        return this._id;
    }

    public set id(id: string) {
        this._id = id;
    }

    public toSerializable(): SerializableCardComment {
        const l = new SerializableCardComment();
        l.id = this.id
        l.content = this.content
        l.createdAt = this.createdAt
        l.deleted = this.deleted
        return l;
    }

    public static fromSerializable(board: Board, s: SerializableCardComment) {
        const l = new CardComment(s.id, s.content)
        l.createdAt = s.createdAt || 0  // FIXME old version had no createdAt... DELETE this check on product release
        l.deleted = s.deleted || false  // FIXME old version had no deleted... DELETE this check on product release
        return l;
    }

    public static create(content: string): CardComment {
        return new CardComment(uuid(), content)
    }
}

export class SerializableCardComment {
    public id = "";
    public content = "";
    public createdAt = 0;
    public deleted = false;
}
