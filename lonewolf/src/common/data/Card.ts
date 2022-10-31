import { ref } from "vue"
import type { Ref } from "vue"
import { v1 as uuid } from "uuid";

import type List from "@/common/data/List";
import type Transaction from "@/common/data/Transaction";
import Indexable from "@/common/Indexable"
import type Vueable from "@/common/Vueable"

export default class Card extends Indexable  implements Vueable{
    private _list: List;

    constructor(list: List, id: string, name: string) {
        super(id, name, -1)
        this._list = list;
        this._vueTicker = ref("")
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

    public execTransaction(t: Transaction): boolean {
        return this.list.execTransaction(t)
    }

    public transactionDone(transaction: Transaction) {
        this._vueTicker.value = transaction.id()
    }

    private _vueTicker: Ref<string>;
    public vueTicker(): Ref<string> {
        return this._vueTicker
    }

}
