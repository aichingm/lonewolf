import { v4 as uuid } from "uuid";
import List from "./List";
import Card from "./Card";
import type Board from "./Board";


export default interface Transaction {
    id(): string
    do(): boolean
    undo(): boolean
}

export class BaseTransaction {
    private _created: number;
    constructor () {
        this._created = Date.now();
    }

    public created(): number {
        return this._created;
    }
}

export class IdentifiableTransaction extends BaseTransaction {
    private _id: string;
    constructor () {
        super()
        this._id = uuid();
    }

    public id(): string {
        return this._id;
    }
}

export class NewListTransaction extends IdentifiableTransaction implements Transaction{
    private _title: string;
    private _board: Board;

    constructor (board: Board, title: string) {
        super()
        this._board = board
        this._title = title
    }

    do(): boolean {
        console.log("NewListTransaction", this._title)

        const list = List.create(this._board, this._title);
        this._board.lists.add(list)
        list.attachTo(this._board)
        this._board.lists.reindex()
        this._board.transactionDone(this)
        return true
    }
    // eslint-disable-next-line no-empty-function
    undo(): boolean{
        // TODO
        return false
    }

}

export class NewCardTransaction extends IdentifiableTransaction implements Transaction{
    private _title: string;
    private _list: List;

    constructor (list: List, title: string) {
        super()
        this._list = list
        this._title = title
    }

    do(): boolean {
        console.log("NewCardTransaction", this._list.id, this._title)

        const card = Card.create(this._list, this._title);
        this._list.cards.add(card)
        card.attachTo(this._list)
        this._list.cards.reindex()
        this._list.transactionDone(this)
        return true
    }

    // eslint-disable-next-line no-empty-function
    undo(): boolean{
        // TODO
        return false
    }

}

export class ListSortTransaction extends IdentifiableTransaction implements Transaction{
    private _oldPosition: number;
    private _newPosition: number;
    private _list: List;

    constructor (list: List, oldPosition: number, newPosition: number) {
        super()
        this._list = list
        this._oldPosition = oldPosition
        this._newPosition = newPosition
    }

    do(): boolean {
        console.log("ListSortTransaction", this._list.id, this._oldPosition, this._newPosition)

        const board = this._list.board;
        const list = board.lists.items[this._oldPosition];
        board.lists.items.splice(this._oldPosition, 1);
        board.lists.items.splice(this._newPosition, 0, list);

        board.lists.reindex()
        board.transactionDone(this)
        return true
    }

    // eslint-disable-next-line no-empty-function
    undo(): boolean{
        // TODO
        return false
    }

}

export class CardSortTransaction extends IdentifiableTransaction implements Transaction{
    private _card: Card;
    private _oldPosition: number;
    private _newPosition: number;

    constructor (card: Card, oldPosition: number, newPosition: number) {
        super()
        this._card = card
        this._oldPosition = oldPosition
        this._newPosition = newPosition

    }

    do(): boolean{
        console.log("CardSortTransaction", this._card.id, this._oldPosition, this._newPosition)

        const list = this._card.list;
        list.cards.items.splice(this._oldPosition, 1);
        list.cards.items.splice(this._newPosition, 0, this._card);

        list.cards.reindex()
        list.transactionDone(this)
        return true
    }

    // eslint-disable-next-line no-empty-function
    undo(): boolean{
        // TODO
        return false
    }
}


export class CardMoveTransaction extends IdentifiableTransaction implements Transaction{
    private _card: Card;
    private _oldPosition: number;
    private _newPosition: number;
    private _oldList: List;
    private _newList: List;

    constructor (card: Card, oldList: List, oldPosition: number, newList: List, newPosition: number) {
        super()
        this._card = card
        this._oldList = oldList
        this._oldPosition = oldPosition
        this._newList = newList
        this._newPosition = newPosition

    }

    do(): boolean {
        console.log("CardMoveTransaction", this._card.id, this._oldList.id, this._oldPosition, this._newList.id, this._newPosition)

        this._oldList.cards.items.splice(this._oldPosition, 1);
        this._newList.cards.items.splice(this._newPosition, 0, this._card);

        this._card.attachTo(this._newList)

        this._oldList.cards.reindex()
        this._newList.cards.reindex()

        this._oldList.transactionDone(this)
        this._newList.transactionDone(this)

        return true
    }

    // eslint-disable-next-line no-empty-function
    undo(): boolean {
        // TODO
        return false
    }
}
