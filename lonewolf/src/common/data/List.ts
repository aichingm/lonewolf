import { v4 as uuid } from "uuid";

import Indexable from "@/common/Indexable";
import IndexedMap from "@/common/IndexedMap";
import type Board from "./Board";
import type Card from "./Card";
import { SDList } from "./extern/SimpleData";



export default class List extends Indexable {
    private _cards = new IndexedMap<Card>();

    private _board: Board;

    constructor(board: Board, id: string, name: string) {
        super(id, name, -1)
        this._board = board;
    }

    public static create(board: Board, title: string): List {
        return new List(board, uuid(), title)
    }

    public get cards(): IndexedMap<Card> {
        return this._cards;
    }

    public addCard(c: Card): void {
        this.cards.add(c)
        c.attachTo(this)
    }

    public insertCard(c: Card): void {
        this.cards.insert(c)
        c.attachTo(this)
    }

    public attachTo(board: Board) {
        this._board = board
    }

    public get board(){
        return this._board
    }

    public toSerializable() {
        const l = new SerializableList();
        l.id = this.id
        l.name = this.name
        l.position = this.position
        return l;
    }

    public static fromSerializable(board: Board, s: SerializableList) {
        const l = new List(board, s.id, s.name)
        l.position = s.position
        return l;
    }

    public toSimpleData(): SDList {
        const l = new SDList(this.id, "no-new-transaction");
        l.cards = Array.from(this.cards.items.map( (c: Card) => {return c.toSimpleData();}));
        return l
    }

}

export class SerializableList {
    public id = "";
    public name = "";
    public position = -1;
}
