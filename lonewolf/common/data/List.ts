import Indexable from "@/common/Indexable";
import IndexedMap from "@/common/IndexedMap";
import type Board from "./Board";
import type Card from "./Card";
import { List as ListObservable } from "../Observable";

export default class List extends Indexable {
    private _cards = new IndexedMap<Card>();
    public cardsAreClosed = false
    public enableCardLimit = false
    public cardLimit = 0
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

    public canAcceptCard() {
        return !this.enableCardLimit || this._cards.items.length < this.cardLimit
    }

    public actualCardLimit(){
        return this.cardLimit == undefined? this.cards.items.length : this.cardLimit
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
        l.enableCardLimit = this.enableCardLimit
        l.cardLimit = this.cardLimit
        l.logbook = [...this._logbook]

        return l;
    }

    public static fromSerializable(board: Board, s: SerializableList) {
        const l = new List(board, s.id, s.name)
        l.position = s.position
        l.cardsAreClosed = s.cardsAreClosed || false
        l.enableCardLimit = s.enableCardLimit  || false
        l.cardLimit = s.cardLimit == undefined ? 0 : s.cardLimit
        if (s.logbook) {  // FIXME old version had no logbook... DELETE this check on product release
            s.logbook.forEach((logEntryId: string)=> {if(board.logbook.get(logEntryId) != undefined){l.logbook.push(logEntryId)}})
        }

        return l;
    }

    public observable(): ListObservable {
        const l = new ListObservable(this.id, "<empty>");
        l.cards = Array.from(this.cards.items.map( (c: Card) => {return c.observable();}));
        return l
    }

}

export class SerializableList {
    public id = "";
    public name = "";
    public position = -1;
    public cardsAreClosed = false;
    public enableCardLimit = false;
    public cardLimit = 0
    public logbook = new Array<string>();

}
