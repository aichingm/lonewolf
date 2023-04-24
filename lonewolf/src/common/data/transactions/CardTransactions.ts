import { MutateTransaction } from "../Transaction";
import type { Transaction } from "../Transaction";
import type Board from "../Board";
import type List from "../List";
import Card from "../Card";
import type Label from "../Label";
import CardComment from "../CardComment";
import CardAttachment from "../CardAttachment";
import type { SDBoard } from "../extern/SimpleData";
import { SDCard } from "../extern/SimpleData";

import { Entry as LogEntry, Kind as LogKind, Action as LogAction } from "../../logs/LogEntry";

import { v1 as uuid } from "uuid";


type CardField = keyof Card
type CardFieldValue = Card[CardField];

export class CardTransaction extends MutateTransaction {
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

    protected label(board: Board, labelId: string): Label {
        const label = board.findLabel(labelId)
        if (label == null) {
            throw new Error("Label[" + labelId + "] not found")
        }
        return label
    }

    protected attachment(board: Board, attachmentId: string): CardAttachment {
        const attachment = this.card(board).findAttachment(attachmentId)
        if (attachment == null) {
            throw new Error("Attachment[" + attachmentId + "] not found")
        }
        return attachment
    }

    protected list(board: Board, listId: string): List {
        const list = board.findList(listId)
        if (list == null) {
            throw new Error("List[" + listId + "] not found")
        }
        return list
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
            .setSubjectKind(LogKind.Card)
            .setSubjectId(this._cardId)
    }

    public applyLogEntry(board: Board, logEntry: LogEntry) {
        this.card(board).logbook.push(logEntry.id)
        board.logbook.set(logEntry.id, logEntry)
    }

}

export class CardChangeTransaction extends CardTransaction implements Transaction {
    protected _field: CardField;
    protected _value: CardFieldValue;

    constructor (cardId: string, field: CardField, value: CardFieldValue) {
        super(cardId)
        this._field = field
        this._value = value
    }

    public apply(board: Board): boolean{
        console.log("CardChangeTransaction", this._cardId, this._field, this._value)
        const card = this.card(board)
        Object.defineProperty(card, this._field, {value: this._value, writable: true });

        this.applyLogEntry(board, this.defaultLogEntry()
            .setAction(LogAction.Change)
            .setObjectId(this._field)
            .setObjectKind(LogKind.Property)
            .setArguments(this._value+""))

        return true
    }

}

export class NewCardTransaction extends CardTransaction implements Transaction {
    private _title: string;
    private _listId: string;

    constructor (listId: string, title: string) {
        super(uuid())
        this._listId = listId
        this._title = title
    }

    public apply(board: Board): boolean {
        console.log("NewCardTransaction", this._listId, this._cardId, this._title)
        const list = this.list(board, this._listId)
        const card = new Card(list, this._cardId, this._title)

        list.cards.add(card)
        board.cards.set(card.id, card)

        this.applyLogEntry(board, this.defaultLogEntry()
            .setAction(LogAction.Create)
            .setArguments(this._listId, this._title))

        return true
    }

    public mutate(t: SDBoard, board: Board): boolean {
        const list = this.list(board, this._listId)

        t.lists[list.position].cards.push(new SDCard(this._cardId, this.id))
        t.lists[list.position].version = this.id
        return true
    }

}

export class AddCommentTransaction extends CardTransaction implements Transaction {
    private _content: string;
    private _comment: CardComment;

    constructor (cardId: string, content: string) {
        super(cardId)
        this._content = content
        this._comment = CardComment.create(this._content)
    }

    public apply(board: Board): boolean{
        console.log("AddCommentTransaction", this._cardId, this._content)
        const card = this.card(board)
        card.comments.push(this._comment)

        this.applyLogEntry(board, this.defaultLogEntry()
            .setAction(LogAction.Connect)
            .setObjectId(this._comment.id)
            .setObjectKind(LogKind.Comment))

        return true
    }

}

export class AddAttachmentTransaction extends CardTransaction implements Transaction {
    private _location: string;
    private _name: string;
    private _mime: string;
    private _attachment: CardAttachment;

    constructor (cardId: string, location: string, name: string, mime: string) {
        super(cardId)
        this._location = location
        this._name = name
        this._mime = mime
        this._attachment = CardAttachment.create(this._location, this._name, this._mime, false)
    }

    public apply(board: Board): boolean{
        console.log("AddAttachmentTransaction", this._cardId, this._location, this._name, this._mime)
        const card = this.card(board)
        card.attachments.push(this._attachment)

        this.applyLogEntry(board, this.defaultLogEntry().setAction(LogAction.Connect).setObjectId(this._attachment.id).setObjectKind(LogKind.Attachment).setArguments(this._name))

        return true
    }

}

export class CardAddLabelTransaction extends CardTransaction implements Transaction {
    private _labelId: string;

    constructor (cardId: string, labelId: string) {
        super(cardId)
        this._labelId = labelId

    }

    public apply(board: Board): boolean{
        console.log("CardAddLabelTransaction", this._cardId, this._labelId)
        const card = this.card(board)
        const label = this.label(board, this._labelId)
        card.labels.push(label)

        this.applyLogEntry(board, this.defaultLogEntry().setAction(LogAction.Connect).setObjectId(this._labelId).setObjectKind(LogKind.Label))

        return true
    }

}

export class CardRemoveLabelTransaction extends CardTransaction implements Transaction {
    private _labelId: string;

    constructor (cardId: string, labelId: string) {
        super(cardId)
        this._labelId = labelId
    }

    public apply(board: Board): boolean{
        console.log("CardRemoveLabelTransaction", this._cardId, this._labelId)
        const card = this.card(board)
        const label = this.label(board, this._labelId)
        card.labels.splice(card.labels.findIndex((l)=>l.id == label.id), 1)

        this.applyLogEntry(board, this.defaultLogEntry().setAction(LogAction.Disconnect).setObjectId(this._labelId).setObjectKind(LogKind.Label))

        return true
    }

}

export class CardSortTransaction extends CardTransaction implements Transaction {
    private _oldPosition: number;
    private _newPosition: number;

    constructor (cardId: string, oldPosition: number, newPosition: number) {
        super(cardId)
        this._oldPosition = oldPosition
        this._newPosition = newPosition
    }

    public apply(board: Board): boolean{
        console.log("CardSortTransaction", this._cardId, this._oldPosition, this._newPosition)
        const card = this.card(board)
        card.list.cards.move(this._oldPosition, this._newPosition)
        return true
    }

    public mutate(t: SDBoard, board: Board):boolean {
        const card = this.card(board)

        const listTree = t.lists[card.list.position]
        const cardTree = listTree.cards[this._oldPosition]
        if ( ! this.isMutationPrevented()) {
            listTree.cards.splice(this._oldPosition, 1);
            listTree.cards.splice(this._newPosition, 0, cardTree);
            listTree.version = this.id
        }
        return true
    }

}

export class CardMoveTransaction extends CardTransaction implements Transaction {
    private _oldPosition: number;
    private _newPosition: number;
    private _oldListId: string;
    private _newListId: string;

    constructor (cardId: string, oldListId: string, oldPosition: number, newListId: string, newPosition: number) {
        super(cardId)
        this._oldListId = oldListId
        this._oldPosition = oldPosition
        this._newListId = newListId
        this._newPosition = newPosition
    }

    public apply(board: Board): boolean{
        console.log("CardMoveTransaction", this._cardId, this._oldListId, this._oldPosition, this._newListId, this._newPosition)

        const oldList = this.list(board, this._oldListId)
        const newList = this.list(board, this._newListId)
        const card = this.card(board)

        oldList.cards.remove(card);
        card.position = this._newPosition
        newList.insertCard(card);

        this.applyLogEntry(board, this.defaultLogEntry()
            .setAction(LogAction.Change)
            .setObjectId('list')
            .setObjectKind(LogKind.Property)
            .setArguments(this._oldListId, this._oldPosition.toString(), this._newListId, this._newPosition.toString()))

        return true
    }

    public mutate(t: SDBoard, board: Board): boolean {

        const oldList = this.list(board, this._oldListId)
        const newList = this.list(board, this._newListId)

        const oldListTree = t.lists[oldList.position]
        const newListTree = t.lists[newList.position]

        const cardTree = this.isMutationPrevented() ? newListTree.cards[this._newPosition] : oldListTree.cards[this._oldPosition];

        if ( ! this.isMutationPrevented()) {
            oldListTree.cards.splice(this._oldPosition, 1)
            newListTree.cards.splice(this._newPosition, 0, cardTree);
        }
        cardTree.version = this.id
        newListTree.version = this.id
        oldListTree.version = this.id
        return true
    }

}

