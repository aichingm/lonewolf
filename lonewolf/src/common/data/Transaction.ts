import { v4 as uuid } from "uuid";
import List from "./List";
import Card from "./Card";
import type Board from "./Board";

export default interface Transaction {
    id(): string
    apply(b: Board): boolean
    // NOTICE keep this limitations in mind https://v2.vuejs.org/v2/guide/reactivity.html#For-Arrays
    mutateTransactionTree(t: TransactionTree, b: Board): boolean
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

export class TransactionTree {
    public nodes = new Array<TransactionTree>();
    public id = "";
    public lastTransactionId = "";

    constructor (id: string, lastTransactionId: string) {
        this.id = id;
        this.lastTransactionId = lastTransactionId;
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
    private _listId: string;

    constructor (title: string) {
        super()
        this._title = title

    }

    apply(board: Board): boolean {
        console.log("NewListTransaction", this._title)

        const list = List.create(board, this._title);
        this._listId = list.id
        board.lists.add(list)
        return true
    }

    mutateTransactionTree(t: TransactionTree, _b: Board) {
        t.lastTransactionId = this.id
        t.nodes.push(new TransactionTree(this._listId, this.id))
    }

}

export class NewCardTransaction extends IdentifiableTransaction implements Transaction{
    private _title: string;
    private _listId: string;
    private _cardId: string;

    constructor (listId: string, title: string) {
        super()
        this._listId = listId
        this._title = title
    }

    apply(board: Board): boolean {
        console.log("NewCardTransaction", this._listId, this._title)

        const list = board.findList(this._listId)

        const card = Card.create(list, this._title);
        list.cards.add(card)
        board.cards.set(card.id, card)

        this._cardId = card.id
        return true
    }

    mutateTransactionTree(t: TransactionTree, b: Board) {
        t.nodes[b.findList(this._listId).position].nodes.push(new TransactionTree(this._cardId, this.id))
        t.nodes[b.findList(this._listId).position].lastTransactionId = this.id
    }

}

export class ListSortTransaction extends IdentifiableTransaction implements Transaction{
    private _oldPosition: number;
    private _newPosition: number;
    private _listId: string;

    constructor (listId: string, oldPosition: number, newPosition: number) {
        super()
        this._listId = listId
        this._oldPosition = oldPosition
        this._newPosition = newPosition
    }

    apply(board: Board): boolean {
        console.log("ListSortTransaction", this._listId, this._oldPosition, this._newPosition)
        board.lists.move(this._oldPosition, this._newPosition)
        return true
    }

    mutateTransactionTree(t: TransactionTree, _b: Board) {
        t.lastTransactionId = this.id
        const listTransactionTree = t.nodes[this._oldPosition]
        t.nodes.splice(this._oldPosition, 1);
        t.nodes.splice(this._newPosition, 0, listTransactionTree);
    }

}

export class CardSortTransaction extends IdentifiableTransaction implements Transaction{
    private _cardId: string;
    private _oldPosition: number;
    private _newPosition: number;

    constructor (cardId: string, oldPosition: number, newPosition: number) {
        super()
        this._cardId = cardId
        this._oldPosition = oldPosition
        this._newPosition = newPosition

    }

    apply(board: Board): boolean{
        console.log("CardSortTransaction", this._cardId, this._oldPosition, this._newPosition)
        board.findCard(this._cardId).list.cards.move(this._oldPosition, this._newPosition)
        return true
    }

    mutateTransactionTree(t: TransactionTree, board: Board) {
        const listTree = t.nodes[board.findCard(this._cardId).list.position]
        const cardTree = listTree.nodes[this._oldPosition]
        listTree.nodes.splice(this._oldPosition, 1);
        listTree.nodes.splice(this._newPosition, 0, cardTree);
        listTree.lastTransactionId = this.id
    }

}

export class CardMoveTransaction extends IdentifiableTransaction implements Transaction{
    private _cardId: string;
    private _oldPosition: number;
    private _newPosition: number;
    private _oldListId: string;
    private _newListId: string;

    constructor (cardId: string, oldListId: string, oldPosition: number, newListId: string, newPosition: number) {
        super()
        this._cardId = cardId
        this._oldListId = oldListId
        this._oldPosition = oldPosition
        this._newListId = newListId
        this._newPosition = newPosition
    }

    apply(board: Board): boolean{
        console.log("CardMoveTransaction", this._cardId, this._oldListId, this._oldPosition, this._newListId, this._newPosition)

        const oldList = board.findList(this._oldListId)
        const newList = board.findList(this._newListId)
        const card = board.findCard(this._cardId)

        oldList.cards.remove(this._oldPosition);
        card.position = this._newPosition
        newList.insertCard(card);

        return true
    }

    mutateTransactionTree(t: TransactionTree, board: Board) {

        const oldListTree = t.nodes[board.findList(this._oldListId).position]
        const newListTree = t.nodes[board.findList(this._newListId).position]
        const cardTree = oldListTree.nodes[this._oldPosition]

        oldListTree.nodes.splice(this._oldPosition, 1)
        newListTree.nodes.splice(this._newPosition, 0, cardTree);

        cardTree.lastTransactionId = this.id
    }

}
