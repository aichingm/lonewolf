import { v1 as uuid } from "uuid";

import type List from "@/common/data/List";
import type Label from "@/common/data/Label";
import CardComment from "@/common/data/CardComment";
import type { SerializableCardComment } from "@/common/data/CardComment";
import { SDCard } from "./extern/SimpleData";
import type Board from "@/common/data/Board";
import Indexable from "@/common/Indexable"

export default class Card extends Indexable{
    private _list: List;
    private _description = "";
    private _labels = new Array<Label>();
    private _comments = new Array<CardComment>();
    private _dueDate: number | null = null; //this is in utc ALWAYS!!!


    constructor(list: List, id: string, name: string) {
        super(id, name, -1)
        this._list = list;
    }

    public static create(list: List, title: string): Card {
        return new Card(list, uuid(), title)
    }

    public attachTo(list: List) {
        this._list = list
    }

    public get list(): List{
        return this._list
    }

    public get labels(): Array<Label>{
        return this._labels
    }

    public get comments(): Array<CardComment>{
        return this._comments
    }

    public get description(): string {
        return this._description
    }

    public set description(description: string){
        this._description = description
    }

    public get dueDate(): number | null {
        return this._dueDate
    }

    public set dueDate(dueDate: number | null){
        this._dueDate = dueDate
    }

    public toSerializable() {
        const c = new SerializableCard();
        c.id = this.id
        c.name = this.name
        c.position = this.position
        c.listId = this.list.id
        c.labels = this.labels.map((l: Label) => l.id);
        c.comments = this.comments.map((c: CardComment) => c.toSerializable());
        c.description = this.description
        c.dueDate = this.dueDate

        return c
    }

    public static fromSerializable(board: Board, s: SerializableCard) {
        const list = board.findList(s.listId)
        if (list == null) {
            throw new Error("List[" + s.listId + "] not found")
        }
        const card = new Card(list, s.id, s.name)
        card.position = s.position
        card.list.cards.put(card)
        card.description = s.description
        card.dueDate = s.dueDate
        if (s.labels) {  // FIXME old version had no labels... DELETE this check on product release
            s.labels.forEach((labelId)=> {const l = board.findLabel(labelId); if(l!=null){card.labels.push(l)}})
        }

        if (s.comments) {  // FIXME old version had no comments... DELETE this check on product release
            s.comments.forEach((comment: SerializableCardComment)=> {card.comments.push(CardComment.fromSerializable(board, comment))})
        }

        return card;
    }

    public toSimpleData(): SDCard {
        return new SDCard(this.id, "no-new-transaction");
    }
}

export class SerializableCard {

    public id = "";
    public name = "";
    public listId = "";
    public position = -1;
    public description = "";
    public labels = new Array<string>();
    public dueDate: number | null = null; //this is in utc ALWAYS!!!
    public comments = new Array<SerializableCardComment>();
}
