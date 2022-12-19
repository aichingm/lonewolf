import { v1 as uuid } from "uuid";

import type List from "@/common/data/List";
import { TransactionTree } from "@/common/data/Transaction";
import Indexable from "@/common/Indexable"

export default class Card extends Indexable{
    private _list: List;

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

    public get list(){
        return this._list
    }

    public toSerializable() {
        const c = new SerializableCard();
        c.id = this.id
        c.name = this.name
        c.position = this.position
        c.listId = this.list.id
        return c
    }

    public static fromSerializable(board: Board, s: SerializableCard) {
        const list = board.findList(s.listId)
        console.log("sc", s)
        const c = new Card(list, s.id, s.name)
        c.position = s.position
        c.list.cards.put(c)
        return c;
    }

    public toTransactionTree(): TransactionTree {
        const t = new TransactionTree();
        t.id = this.id
        t.lastTransactionId = "no-new-transaction"
        t.nodes = [];
        return t
    }
}

export class SerializableCard {

    public id = "";
    public name = "";
    public listId = "";
    public position: number;


}

