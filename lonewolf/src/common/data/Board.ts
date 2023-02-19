import { v1 as uuid } from "uuid";

import NamedIdentifiable from "@/common/NamedIdentifiable";
import IndexedMap from "@/common/IndexedMap";
import List from "@/common/data/List";
import type { SerializableList } from "@/common/data/List";
import type { SerializableLabel } from "@/common/data/Label";
import Card from "@/common/data/Card";
import Label from "@/common/data/Label";
import type { SerializableCard } from "@/common/data/Card";
import type Transaction from "@/common/data/Transaction";
import { SDBoard } from "./extern/SimpleData";



export default class Board extends NamedIdentifiable {

    private _settings: object = {};

    private _lists = new IndexedMap<List>();
    private _cards = new Map<string, Card>();
    private _labels = new Map<string, Label>();

    public createdAt = 0

    private _transactions: Transaction[];

    constructor() {
        super(uuid(), "")
        this._transactions = []

        /*for(const l of [["High", "#D00000"], ["OK", "#FFBA08"], ["Low", "#55AA55"], ["dark", "black"]]) {
            const label = new Label();
            label.name = l[0]
            label.color = l[1]
            this.labels.set(label.id, label)
        }*/

    }

    public get lists(): IndexedMap<List> {
        return this._lists;
    }

    public get cards(): Map<string, Card> {
        return this._cards
    }

    public get labels(): Map<string, Label> {
        return this._labels
    }

    public findCard(id: string): Card | null {
        return this._cards.get(id) || null
    }

    public findList(id: string): List | null {
        return this._lists.find(id)
    }

    public findLabel(id: string): Label | null {
        const l = this._labels.get(id)
        return l == undefined ? null : l;
    }

    public get transactions(): Transaction[] {
        return this._transactions;
    }

    public toSimpleData(): SDBoard {
        const b = new SDBoard(this.id, "no-new-transaction");
        b.lists = Array.from(this.lists.items.map( (l: List) => {return l.toSimpleData();}));
        b.labels = Array.from(this.labels.values()).map( (l: Label) => {return l.toSimpleData();});
        return b
    }

    public toSerializable() {
        const b = new SerializableBoard();
        b.id = this.id
        b.name = this.name
        b.createdAt = this.createdAt
        b.lists = this.lists.items.map( (l: List) => {return l.toSerializable();});
        b.labels = Array.from(this.labels.values()).map( (l: Label) => {return l.toSerializable();});
        b.cards = Array.from(this.cards.values()).map( (c: Card) => {return c.toSerializable();});
        return b
    }

    public static fromSerializable(s: SerializableBoard) {
        const b = new Board()
        b.id = s.id
        b.name = s.name
        b.createdAt = s.createdAt
        b._settings = {};

        s.lists.forEach(l => b.lists.put(List.fromSerializable(b, l)))

        if (s.labels) { // FIXME old version had no labels... DELETE this check on product release
            b.labels.clear() // this is only needed to remove default labels, hack
            s.labels.forEach(l => b.labels.set(l.id, Label.fromSerializable(b, l)))
        }

        s.cards.forEach(c => b.cards.set(c.id, Card.fromSerializable(b, c)))
        return b
    }


}

export class SerializableBoard {

    public lists: SerializableList[] = new Array<SerializableList>();
    public labels: SerializableLabel[] = new Array<SerializableLabel>();
    public cards: SerializableCard[] = new Array<SerializableCard>();
    public id = "";
    public name = "";
    public createdAt = 0;

}

