import { IdentifiableTransaction } from "../Transaction";
import type { Transaction } from "../Transaction";
import type Board from "../Board";
import type Card from "../Card";
import type { SDBoard } from "../extern/SimpleData";



export class CardChangeTransaction extends IdentifiableTransaction {
    protected _cardId: string;

    constructor (cardId: string) {
        super()
        this._cardId = cardId
    }

    protected card(board: Board): Card {
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }
        return card;
    }

    public mutate(t: SDBoard, board: Board): boolean {
        const card = this.card(board)
        const listTree = t.lists[card.list.position]
        listTree.version = this.id
        const cardTree = listTree.cards[card.position]
        cardTree.version = this.id
        return true
    }

}

export class DueDateTransaction extends CardChangeTransaction implements Transaction {
    private _dueDate: number | null;

    constructor (cardId: string, dueDate: number | null) {
        super(cardId)
        this._dueDate = dueDate
    }

    public apply(board: Board): boolean{
        console.log("DueDateTransaction", this._cardId, this._dueDate)
        const card = this.card(board)
        card.dueDate = this._dueDate
        return true
    }

}
