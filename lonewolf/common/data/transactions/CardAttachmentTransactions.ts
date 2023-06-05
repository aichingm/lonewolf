import { IdentifiableTransaction } from "../Transaction";
import type { Transaction } from "../Transaction";
import type Board from "../Board";
import type Card from "../Card";
import type CardAttachment from "../CardAttachment";
import type { SDBoard } from "../extern/SimpleData";

import { Entry as LogEntry, Kind as LogKind, Action as LogAction } from "../../logs/LogEntry";

type CardAttachmentField = keyof CardAttachment
type CardAttachmentValue = CardAttachment[CardAttachmentField];




export class CardAttachmentTransaction extends IdentifiableTransaction {
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


export class CardAttachmentChangeTransaction extends CardAttachmentTransaction implements Transaction{
    protected _field: CardAttachmentField;
    protected _value: CardAttachmentValue;

    constructor (cardId: string, attachmentId: string, field: CardAttachmentField, value: CardAttachmentValue) {
        super(cardId, attachmentId)
        this._field = field
        this._value = value
    }

    public apply(board: Board): boolean{
        console.log("CardAttachmentChangeTransaction", this._cardId, this._attachmentId, this._field, this._value)
        const card = this.card(board)
        const attachment = this.attachment(card, this._attachmentId)
        Object.defineProperty(attachment, this._field, {value: this._value, writable: true });

        this.applyLogEntry(board, this.defaultLogEntry()
            .setSubjectKind(LogKind.Card)
            .setSubjectId(this._cardId)
            .setAction(LogAction.Disconnect)
            .setObjectId(this._attachmentId)
            .setObjectKind(LogKind.Attachment)
            .setArguments(attachment.name))

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

}

export class CardAttachmentContentChangeTransaction extends CardAttachmentTransaction implements Transaction{
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

    public mutate(t: SDBoard, board: Board): boolean {
        const card = this.card(board)
        const listTree = t.lists[card.list.position]
        listTree.version = this.id
        const cardTree = listTree.cards[card.position]
        cardTree.version = this.id
        return true
    }
}
