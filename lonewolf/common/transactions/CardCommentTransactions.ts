import { BoardTransaction as BaseTransaction } from "./Transaction";
import type Board from "../data/Board";
import type Card from "../data/Card";
import type CardComment from "../data/CardComment";
import type { Board as BoardObservable } from "../Observable";

import { Entry as LogEntry, Kind as LogKind, Action as LogAction } from "../logs/LogEntry";


export class CardCommentChangeTransaction<Field extends keyof CardComment> extends BaseTransaction {
    protected _cardId: string;
    protected _commentId: string;
    protected _field: Field;
    protected _value: CardComment[Field];

    constructor (cardId: string, commentId: string, field: Field, value: CardComment[Field]) {
        super()
        this._cardId = cardId
        this._commentId = commentId
        this._field = field
        this._value = value
    }

    protected card(board: Board): Card {
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }
        return card;
    }

    protected comment(card: Card, commentId: string): CardComment{
        const comment = card.comments.find(c=>c.id == commentId)
        if (comment == null) {
            throw new Error("CardComment[" + commentId + "] not found on Card[" + card.id + "]")
        }
        return comment;
    }

    public apply(board: Board): boolean{
        console.log("CardCommentChangeTransaction", this._cardId, this._commentId, this._field, this._value)
        const card = this.card(board)
        const comment = this.comment(card, this._commentId)
        comment[this._field] = this._value

        this.applyLogEntry(board, this.defaultLogEntry()
            .setSubjectKind(LogKind.Card)
            .setSubjectId(this._cardId)
            .setAction(LogAction.Disconnect)
            .setObjectKind(LogKind.Comment)
            .setObjectId(this._commentId))

        return true
    }

    public mutate(bo: BoardObservable, board: Board): boolean {
        const card = this.card(board)
        const listTree = bo.lists[card.list.position]
        listTree.version = this.id
        const cardTree = listTree.cards[card.position]
        cardTree.version = this.id
        return true
    }

    public defaultLogEntry(): LogEntry {
        return (new LogEntry())
            .setTimestamp(this.createdAt)
            .setInitiator("self")
    }

    public applyLogEntry(board: Board, logEntry: LogEntry) {
        board.logbook.set(logEntry.id, logEntry)
        this.card(board).logbook.push(logEntry.id)
    }

}

