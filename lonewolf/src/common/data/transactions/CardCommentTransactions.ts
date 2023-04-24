import { IdentifiableTransaction } from "../Transaction";
import type { Transaction } from "../Transaction";
import type Board from "../Board";
import type Card from "../Card";
import type CardComment from "../CardComment";
import type { SDBoard } from "../extern/SimpleData";

import { Entry as LogEntry, Kind as LogKind, Action as LogAction } from "../../logs/LogEntry";

type CardCommentField = keyof CardComment
type CardCommentValue = CardComment[CardCommentField];


export class CardCommentChangeTransaction extends IdentifiableTransaction implements Transaction{
    protected _cardId: string;
    protected _commentId: string;
    protected _field: CardCommentField;
    protected _value: CardCommentValue;

    constructor (cardId: string, commentId: string, field: CardCommentField, value: CardCommentValue) {
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
        Object.defineProperty(comment, this._field, {value: this._value, writable: true });

        this.applyLogEntry(board, this.defaultLogEntry()
            .setSubjectKind(LogKind.Card)
            .setSubjectId(this._cardId)
            .setAction(LogAction.Disconnect)
            .setObjectKind(LogKind.Comment)
            .setObjectId(this._commentId))

        return true
    }

    public mutate(t: SDBoard, board: Board): boolean {
        const card = this.card(board)
        const listTree = t.lists[card.list.position]
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


