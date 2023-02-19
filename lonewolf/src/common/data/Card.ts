import { v1 as uuid } from "uuid";

import type List from "@/common/data/List";
import type Label from "@/common/data/Label";
import { SDCard } from "./extern/SimpleData";
import type Board from "@/common/data/Board";
import Indexable from "@/common/Indexable"

export default class Card extends Indexable{
    private _list: List;
    private _description = "";
    private _labels = new Array<Label>();


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

    public get description(): string {
        return this._description
    }

    public set description(description: string){
        this._description = description
    }

    public toSerializable() {
        const c = new SerializableCard();
        c.id = this.id
        c.name = this.name
        c.position = this.position
        c.listId = this.list.id
        c.description = this._description
        c.labels = this.labels.map((l: Label) => l.id);

        return c
    }

    public static fromSerializable(board: Board, s: SerializableCard) {
        const list = board.findList(s.listId)
        if (list == null) {
            throw new Error("List[" + s.listId + "] not found")
        }
        const c = new Card(list, s.id, s.name)
        c.position = s.position
        c.list.cards.put(c)
        c.description = s.description
        c.description = s.description
        if (s.labels) {  // FIXME old version had no labels... DELETE this check on product release
            s.labels.forEach((labelId)=> {const l = board.findLabel(labelId); if(l!=null){c.labels.push(l)}})
        }

        return c;
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
}
