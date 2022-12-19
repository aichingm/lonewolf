import NamedIdentifiable from "@/common/NamedIdentifiable";
import IndexedMap from "@/common/IndexedMap";
import List from "@/common/data/List";
import Card from "@/common/data/Card";
import type Transaction from "@/common/data/Transaction";
import { TransactionTree } from "@/common/data/Transaction";

//import ChangeProvider from "@/common/data/ChangeListener";
//import type { ChangeListener} from "@/common/data/ChangeListener";


export default class Board extends NamedIdentifiable {

    private _settings: object = {};

    private _lists = new IndexedMap<List>();
    private _cards = new Map<string, Card>();


    private _transactions: Transaction[];

    constructor(id: string, name: string) {
        super(id, name)
        this._transactions = []
    }

    public get lists(): IndexedMap<List> {
        return this._lists;
    }

    public get cards(): Map<string, Card> {
        return this._cards
    }

    public findCard(id: string): Card | null {
        return this._cards.get(id)
    }

    public findList(id: string): Card | null {
        return this._lists.find(id)
    }

    public get transactions(): Transaction[] {
        return this._transactions;
    }

    public toTransactionTree(): TransactionTree {
        const t = new TransactionTree();
        t.id = this.id
        t.lastTransactionId = "no-new-transaction"
        t.nodes = Array.from(this.lists.items.map( (l: List) => {return l.toTransactionTree();}));
        //Array<TransactionTree>()
        return t
    }

    public toSerializable() {
        const b = new SerializableBoard();
        b.id = this.id
        b.name = this.name
        b.lists = this.lists.items.map( (l: List) => {return l.toSerializable();});
        b.cards = Array.from(this.cards.values()).map( (c: Card) => {return c.toSerializable();});
        return b
    }

    public static fromSerializable(s: SerializableBoard) {
        const b = new Board(s.id, s.name)
        b._settings = {};
        b._lists = new IndexedMap<List>();
        b._cards.clear();
        b._transactions = new Array<Transaction>;

        s.lists.forEach(l => b.lists.put(List.fromSerializable(b, l)))

        s.cards.forEach(c => b.cards.set(c.id, Card.fromSerializable(b, c)))
        return b
    }

}

export class SerializableBoard {

    public lists: SerializableList[] = new Array<SerializableList>();
    public cards: SerializableCard[] = new Array<SerializableCard>();
    public id = "";
    public name = "";

}

