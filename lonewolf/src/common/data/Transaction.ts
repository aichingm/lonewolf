import { v4 as uuid } from "uuid";
import List from "./List";
import Card from "./Card";
import type Board from "./Board";

export default interface Transaction {
    id: string
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

    public get version() {
        return this.lastTransactionId
    }

    public reset() {
        this.lastTransactionId = uuid()
        this.nodes.splice(0, this.nodes.length)
    }

}

export class IdentifiableTransaction extends BaseTransaction {
    private _id: string;
    constructor () {
        super()
        this._id = uuid();
    }

    public get id(): string {
        return this._id;
    }
}

export class MutateTransaction extends IdentifiableTransaction {

    private _preventMutation = false;

    constructor () {
        super()
    }

    public preventMutation(prevent?: boolean): MutateTransaction {
        this._preventMutation = prevent === undefined ? true : prevent;
        return this
    }

    public isMutationPrevented(): boolean {
        return this._preventMutation;
    }

}

export class NewBoardTransaction extends IdentifiableTransaction implements Transaction {

    constructor () {
        super()
    }

    public apply(board: Board): boolean {
        console.log("NewBoardTransaction", new Date().getTime())
        board.createdAt = new Date().getTime();
        return true
    }

    public mutateTransactionTree(t: TransactionTree, _b: Board): boolean {
        t.lastTransactionId = this.id;
        return true
    }

}

export class BoardRenameTransaction extends IdentifiableTransaction implements Transaction {

    private _name: string = ""

    constructor (name: string) {
        super()
        this._name = name
    }

    public apply(board: Board): boolean {
        console.log("BoardRenameTransaction", this._name)
        board.name = this._name;
        return true
    }

    public mutateTransactionTree(t: TransactionTree, _b: Board): boolean {
        t.lastTransactionId = this.id;
        return true
    }

}

export class NewListTransaction extends IdentifiableTransaction implements Transaction {
    private _title = "";
    private _listId = "";

    constructor (title: string) {
        super()
        this._title = title

    }

    public apply(board: Board): boolean {
        console.log("NewListTransaction", this._title)

        const list = List.create(board, this._title);
        this._listId = list.id
        board.lists.add(list)
        return true
    }

    public mutateTransactionTree(t: TransactionTree, _b: Board): boolean {
        t.lastTransactionId = this.id
        t.nodes.push(new TransactionTree(this._listId, this.id))
        return true
    }

}

export class NewCardTransaction extends IdentifiableTransaction implements Transaction {
    private _title: string;
    private _listId: string;
    private _cardId = "";

    constructor (listId: string, title: string) {
        super()
        this._listId = listId
        this._title = title
    }

    public apply(board: Board): boolean {
        console.log("NewCardTransaction", this._listId, this._title)

        const list = board.findList(this._listId)

        if (list == null) {
            throw new Error("List[" + this._listId + "] not found")
        }

        const card = Card.create(list, this._title);
        list.cards.add(card)
        board.cards.set(card.id, card)

        this._cardId = card.id
        return true
    }

    public mutateTransactionTree(t: TransactionTree, b: Board): boolean {
        const list = b.findList(this._listId)
        if (list == null) {
            throw new Error("List[" + this._listId + "] not found")
        }

        t.nodes[list.position].nodes.push(new TransactionTree(this._cardId, this.id))
        t.nodes[list.position].lastTransactionId = this.id
        return true
    }

}

export class ListSortTransaction extends MutateTransaction implements Transaction{
    private _oldPosition: number;
    private _newPosition: number;
    private _listId: string;

    constructor (listId: string, oldPosition: number, newPosition: number) {
        super()
        this._listId = listId
        this._oldPosition = oldPosition
        this._newPosition = newPosition
    }

    public apply(board: Board): boolean {
        console.log("ListSortTransaction", this._listId, this._oldPosition, this._newPosition)
        board.lists.move(this._oldPosition, this._newPosition)
        return true
    }

    public mutateTransactionTree(t: TransactionTree, _b: Board): boolean {
        if ( ! this.isMutationPrevented()) {
            const listTransactionTree = t.nodes[this._oldPosition]
            t.nodes.splice(this._oldPosition, 1);
            t.nodes.splice(this._newPosition, 0, listTransactionTree);
        }

        t.lastTransactionId = this.id
        return true
    }

}

export class CardSortTransaction extends MutateTransaction implements Transaction {
    private _cardId: string;
    private _oldPosition: number;
    private _newPosition: number;

    constructor (cardId: string, oldPosition: number, newPosition: number) {
        super()
        this._cardId = cardId
        this._oldPosition = oldPosition
        this._newPosition = newPosition
    }

    public apply(board: Board): boolean{
        console.log("CardSortTransaction", this._cardId, this._oldPosition, this._newPosition)
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }

        card.list.cards.move(this._oldPosition, this._newPosition)
        return true
    }

    public mutateTransactionTree(t: TransactionTree, board: Board):boolean {
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }
        const listTree = t.nodes[card.list.position]
        const cardTree = listTree.nodes[this._oldPosition]
        if ( ! this.isMutationPrevented()) {
            listTree.nodes.splice(this._oldPosition, 1);
            listTree.nodes.splice(this._newPosition, 0, cardTree);
            listTree.lastTransactionId = this.id
        }
        return true
    }

}

export class CardMoveTransaction extends MutateTransaction implements Transaction {
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

    public apply(board: Board): boolean{
        console.log("CardMoveTransaction", this._cardId, this._oldListId, this._oldPosition, this._newListId, this._newPosition)

        const oldList = board.findList(this._oldListId)
        if (oldList == null) {
            throw new Error("List[" + this._oldListId + "] not found")
        }
        const newList = board.findList(this._newListId)
        if (newList == null) {
            throw new Error("List[" + this._newListId + "] not found")
        }
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }

        oldList.cards.remove(card);
        card.position = this._newPosition
        newList.insertCard(card);

        return true
    }

    public mutateTransactionTree(t: TransactionTree, board: Board): boolean {

        const oldList = board.findList(this._oldListId)
        if (oldList == null) {
            throw new Error("List[" + this._oldListId + "] not found")
        }
        const newList = board.findList(this._newListId)
        if (newList == null) {
            throw new Error("List[" + this._newListId + "] not found")
        }


        const oldListTree = t.nodes[oldList.position]
        const newListTree = t.nodes[newList.position]

        const cardTree = this.isMutationPrevented() ? newListTree.nodes[this._newPosition] : oldListTree.nodes[this._oldPosition];

        if ( ! this.isMutationPrevented()) {
            oldListTree.nodes.splice(this._oldPosition, 1)
            newListTree.nodes.splice(this._newPosition, 0, cardTree);
        }
        cardTree.lastTransactionId = this.id
        newListTree.lastTransactionId = this.id
        oldListTree.lastTransactionId = this.id
        return true
    }

}

export class CardRenameTransaction extends IdentifiableTransaction implements Transaction {
    private _cardId: string;
    private _title: string;

    constructor (cardId: string, title: string) {
        super()
        this._cardId = cardId
        this._title = title

    }

    public apply(board: Board): boolean{
        console.log("CardRenameTransaction", this._cardId, this._title)
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }
        card.name = this._title
        return true
    }

    public mutateTransactionTree(t: TransactionTree, board: Board): boolean {
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }

        const listTree = t.nodes[card.list.position]
        const cardTree = listTree.nodes[card.position]
        cardTree.lastTransactionId = this.id
        listTree.lastTransactionId = this.id
        return true
    }

}

export class ListRenameTransaction extends IdentifiableTransaction implements Transaction {
    private _listId: string;
    private _title: string;

    constructor (listId: string, title: string) {
        super()
        this._listId = listId
        this._title = title

    }

    public apply(board: Board): boolean{
        console.log("ListRenameTransaction", this._listId, this._title)
        const list = board.findCard(this._listId)
        if (list == null) {
            throw new Error("List[" + this._listId + "] not found")
        }
        list.name = this._title
        return true
    }

    public mutateTransactionTree(t: TransactionTree, board: Board): boolean {
        const list = board.findList(this._listId)
        if (list == null) {
            throw new Error("List[" + this._listId + "] not found")
        }
        const listTree = t.nodes[list.position]
        listTree.lastTransactionId = this.id
        t.lastTransactionId = this.id
        return true
    }

}


export class CardDescriptionTransaction extends IdentifiableTransaction implements Transaction {
    private _cardId: string;
    private _description: string;

    constructor (cardId: string, description: string) {
        super()
        this._cardId = cardId
        this._description = description

    }

    public apply(board: Board): boolean{
        console.log("CardDescriptionTransaction", this._cardId, this._description)
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }
        card.description = this._description
        return true
    }

    public mutateTransactionTree(t: TransactionTree, board: Board): boolean {
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }

        const listTree = t.nodes[card.list.position]
        listTree.lastTransactionId = this.id
        const cardTree = listTree.nodes[card.position]
        cardTree.lastTransactionId = this.id
        return true
    }

}
