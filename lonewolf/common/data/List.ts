import Indexable from "@/common/Indexable";
import IndexedMap from "@/common/IndexedMap";
import type Board from "./Board";
import type Card from "./Card";
import { SDList } from "./extern/SimpleData";

export default class List extends Indexable {
    private _cards = new IndexedMap<Card>();
    public cardsAreClosed = false
    private _logbook = new Array<string>();

    private _board: Board;

    constructor(board: Board, id: string, name: string) {
        super(id, name, -1)
        this._board = board;
    }

    public get cards(): IndexedMap<Card> {
        return this._cards;
    }

    public get logbook() {
        return this._logbook
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
        l.cardsAreClosed = this.cardsAreClosed
        l.logbook = [...this._logbook]

        return l;
    }

    public static fromSerializable(board: Board, s: SerializableList) {
        const l = new List(board, s.id, s.name)
        l.position = s.position
        l.cardsAreClosed = s.cardsAreClosed || false
        if (s.logbook) {  // FIXME old version had no logbook... DELETE this check on product release
            s.logbook.forEach((logEntryId: string)=> {if(board.logbook.get(logEntryId) != undefined){l.logbook.push(logEntryId)}})
        }

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
    public cardsAreClosed = false;
    public logbook = new Array<string>();

}
