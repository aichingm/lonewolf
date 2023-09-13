
import type List from "@/common/data/List";
import type Label from "@/common/data/Label";
import CardComment from "@/common/data/CardComment";
import type CardAttachment from "@/common/data/CardAttachment";
import type { SerializableCardComment } from "@/common/data/CardComment";
import { Card as CardObservable } from "../Observable";
import type Board from "@/common/data/Board";
import Indexable from "@/common/Indexable"

export default class Card extends Indexable{
    private _list: List;
    public description = "";
    private _labels = new Array<Label>();
    private _comments = new Array<CardComment>();
    private _attachments = new Array<CardAttachment>();
    private _logbook = new Array<string>();
    public dueDate: number | null = null; //this is in utc ALWAYS!!!


    constructor(list: List, id: string, name: string) {
        super(id, name, -1)
        this._list = list;
    }

    public attachTo(list: List) {
        this._list = list
    }

    public get list(): List{
        return this._list
    }

    public get labels(): Array<Label>{
        return this._labels
    }

    public get comments(): Array<CardComment>{
        return this._comments
    }

    public get attachments(): Array<CardAttachment>{
        return this._attachments
    }

    public get logbook() {
        return this._logbook
    }

    public findAttachment(attachmentId: string): CardAttachment | null {
        return this.attachments.find(a=>a.id==attachmentId) || null
    }

    public findAttachmentByLocation(location: string): CardAttachment | null {
        return this.attachments.find(a=>a.location==location) || null
    }

    public toSerializable() {
        const c = new SerializableCard();
        c.id = this.id
        c.name = this.name
        c.position = this.position
        c.listId = this.list.id
        c.labels = this.labels.map((l: Label) => l.id);
        c.comments = this.comments.map((c: CardComment) => c.toSerializable());
        c.attachments = [...this._attachments]
        c.logbook = [...this._logbook]
        c.description = this.description
        c.dueDate = this.dueDate

        return c
    }

    public static fromSerializable(board: Board, s: SerializableCard) {
        const list = board.findListInclArchives(s.listId);
        if (list == null) {
            throw new Error("List[" + s.listId + "] not found")
        }

        const card = new Card(list, s.id, s.name)
        card.position = s.position
        card.list.cards.put(card)
        card.description = s.description
        card.attachments.push(...(s.attachments||[])) // FIXME old version had no attachments... DELETE this check on product release
        card.dueDate = s.dueDate
        if (s.labels) {  // FIXME old version had no labels... DELETE this check on product release
            s.labels.forEach((labelId)=> {const l = board.findLabel(labelId); if(l!=null){card.labels.push(l)}})
        }

        if (s.comments) {  // FIXME old version had no comments... DELETE this check on product release
            s.comments.forEach((comment: SerializableCardComment)=> {card.comments.push(CardComment.fromSerializable(board, comment))})
        }

        if (s.logbook) {  // FIXME old version had no comments... DELETE this check on product release
            s.logbook.forEach((logEntryId: string)=> {if(board.logbook.get(logEntryId) != undefined){card.logbook.push(logEntryId)}})

        }

        return card;
    }

    public observable(): CardObservable {
        return new CardObservable(this.id, "<empty>");
    }
}

export class SerializableCard {

    public id = "";
    public name = "";
    public listId = "";
    public position = -1;
    public description = "";
    public labels = new Array<string>();
    public dueDate: number | null = null; //this is in utc ALWAYS!!!
    public comments = new Array<SerializableCardComment>();
    public attachments = new Array<CardAttachment>();
    public logbook = new Array<string>();
}
