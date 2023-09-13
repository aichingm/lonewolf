import { BoardTransaction as BaseTransaction } from "./Transaction";
import type Board from "../data/Board";
import type Card from "../data/Card";
import type CardAttachment from "../data/CardAttachment";
import type { Board as BoardObservable } from "../Observable";

import { Entry as LogEntry, Kind as LogKind, Action as LogAction } from "../logs/LogEntry";


export abstract class CardAttachmentTransaction extends BaseTransaction {
    protected _cardId: string;
    protected _attachmentId: string;


    constructor (cardId: string, attachmentId: string) {
        super()
        this._cardId = cardId
        this._attachmentId = attachmentId
    }

    protected card(board: Board): Card {
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }
        return card;
    }

    protected attachment(card: Card, attachmentId: string): CardAttachment{
        const attachment = card.attachments.find(c=>c.id == attachmentId)
        if (attachment == null) {
            throw new Error("CardAttachment[" + attachmentId + "] not found on Card[" + card.id + "]")
        }
        return attachment;
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


export class CardAttachmentChangeTransaction<Field extends keyof CardAttachment> extends CardAttachmentTransaction {
    protected _field: Field;
    protected _value: CardAttachment[Field];

    constructor (cardId: string, attachmentId: string, field: Field, value: CardAttachment[Field]) {
        super(cardId, attachmentId)
        this._field = field
        this._value = value
    }

    public apply(board: Board): boolean{
        console.log("CardAttachmentChangeTransaction", this._cardId, this._attachmentId, this._field, this._value)
        const card = this.card(board)
        const attachment = this.attachment(card, this._attachmentId)
        attachment[this._field] = this._value

        this.applyLogEntry(board, this.defaultLogEntry()
            .setSubjectKind(LogKind.Card)
            .setSubjectId(this._cardId)
            .setAction(LogAction.Disconnect)
            .setObjectId(this._attachmentId)
            .setObjectKind(LogKind.Attachment)
            .setArguments(attachment.name))

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

}

export class CardAttachmentContentChangeTransaction extends CardAttachmentTransaction {
    protected _name: string;
    protected _mime: string;

    constructor (cardId: string, attachmentId: string, name: string, mime:string) {
        super(cardId, attachmentId)
        this._name = name
        this._mime = mime
    }

    public apply(board: Board): boolean{
        console.log("CardAttachmentContentChangeTransaction", this._cardId, this._attachmentId, this._name, this._mime)
        const card = this.card(board)
        const attachment = this.attachment(card, this._attachmentId)
        attachment.name = this._name
        attachment.mime = this._mime

        this.applyLogEntry(board, this.defaultLogEntry()
            .setSubjectKind(LogKind.Card)
            .setSubjectId(this._cardId)
            .setAction(LogAction.Change)
            .setObjectId(this._attachmentId)
            .setObjectKind(LogKind.Attachment)
            .setArguments(this._name, this._mime))
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
}
