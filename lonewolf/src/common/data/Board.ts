import { ref } from "vue"
import type { Ref } from "vue"

import NamedIdentifiable from "@/common/NamedIdentifiable";
import IndexedMap from "@/common/IndexedMap";
import type List from "@/common/data/List";
import type Transaction from "@/common/data/Transaction";
import type Vueable from "@/common/Vueable";


export default class Board extends NamedIdentifiable implements Vueable{

    private _settings: object = {};

    private _lists = new IndexedMap<List>();

    private _transactions: Transaction[];

    constructor(id: string, name: string) {
        super(id, name)
        this._vueTicker = ref("")
        this._transactions = []
    }

    public get lists(): IndexedMap<List> {
        return this._lists;
    }

    public get transactions(): Transaction[] {
        return this._transactions;
    }

    public execTransaction(t: Transaction): boolean {
        const done = t.do();
        if (done) {
            this.transactions.push(t)
        }
        return done;
    }

    public transactionDone(transaction: Transaction) {
        this._vueTicker.value = transaction.id()
    }

    private _vueTicker: Ref<string>;

    public vueTicker(): Ref<string> {
        return this._vueTicker
    }


}
