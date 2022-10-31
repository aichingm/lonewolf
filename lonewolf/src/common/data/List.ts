import { v4 as uuid } from "uuid";
import { ref } from "vue"
import type { Ref } from "vue"

import Indexable from "@/common/Indexable";
import IndexedMap from "@/common/IndexedMap";
import type Board from "./Board";
import type Card from "./Card";
import type Vueable from "@/common/Vueable"
import type Transaction from "@/common/data/Transaction";



export default class List extends Indexable implements Vueable{
    private _cards = new IndexedMap<Card>();

    private _board: Board;


    constructor(board: Board, id: string, name: string) {
        super(id, name, -1)
        this._board = board;
        this._vueTicker = ref("")
    }

    public static create(board: Board, title: string): List {
        return new List(board, uuid(), title)
    }

    public get cards(): IndexedMap<Card> {
        return this._cards;
    }

    public attachTo(board: Board) {
        this._board = board
    }

    public get board(){
        return this._board
    }

    public execTransaction(t: Transaction): boolean {
        return this.board.execTransaction(t)
    }

    public transactionDone(transaction: Transaction) {
        this._vueTicker.value = transaction.id()
    }

    private _vueTicker: Ref<string>;
    public vueTicker(): Ref<string> {
        return this._vueTicker
    }

}
