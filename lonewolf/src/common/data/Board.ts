import { v1 as uuid } from "uuid";

import NamedIdentifiable from "@/common/NamedIdentifiable";
import IndexedMap from "@/common/IndexedMap";
import List from "@/common/data/List";
import Settings from "@/common/data/Settings";
import type { SerializableList } from "@/common/data/List";
import type { SerializableLabel } from "@/common/data/Label";
import Card from "@/common/data/Card";
import Label from "@/common/data/Label";
import type { SerializableCard } from "@/common/data/Card";
import { SDBoard } from "./extern/SimpleData";
import { Factory as StoreFactory } from "@/common/attachments/Store";
import type { Store as AttachmentStore } from "@/common/attachments/Store";
import { Entry as LogEntry } from "@/common/logs/LogEntry";


export default class Board extends NamedIdentifiable {

    private _lists = new IndexedMap<List>();
    private _cards = new Map<string, Card>();
    private _labels = new Map<string, Label>();
    private _logbook = new Map<string, LogEntry>();
    private _settings = new Settings();
    private _attachmentStore: AttachmentStore;

    public createdAt = 0

    constructor(attachmentStore: AttachmentStore) {
        super(uuid(), "")
        this._attachmentStore = attachmentStore
    }

    public get lists(): IndexedMap<List> {
        return this._lists;
    }

    public get cards(): Map<string, Card> {
        return this._cards
    }

    public get labels(): Map<string, Label> {
        return this._labels
    }

    public get logbook(): Map<string, LogEntry> {
        return this._logbook
    }

    public get settings(): Settings {
        return this._settings
    }

    public findCard(id: string): Card | null {
        return this._cards.get(id) || null
    }

    public findList(id: string): List | null {
        return this._lists.find(id)
    }

    public findLabel(id: string): Label | null {
        const l = this._labels.get(id)
        return l == undefined ? null : l;
    }

    public attachmentStore(): AttachmentStore {
        return this._attachmentStore
    }

    public countAttachmentUsage(location: string){
        const attachmentCount = Array.from(this.cards.values()).reduce(
            (a, card)=>{
                const attachment =card.findAttachmentByLocation(location)
                if(attachment!=null&&!attachment.deleted){
                    return a + 1
                }
                return a
            }, 0)
        const descriptionCount =  Array.from(this.cards.values()).reduce((a, card)=>card.description.includes(location)?a+1:a, 0)
        const commentCount =  Array.from(this.cards.values()).reduce((a, card)=>a+card.comments.reduce((A, comment)=>((!comment.deleted)&&comment.content.includes(location))?A+1:A, 0), 0)
        return attachmentCount+descriptionCount+commentCount
    }

    public cardOpenClosedStatistic(): number[] {
        return [
            this.lists.items.filter(l=>!l.cardsAreClosed).reduce((a,list)=>a+list.cards.items.length, 0),
            this.lists.items.filter(l=>l.cardsAreClosed).reduce((a,list)=>a+list.cards.items.length, 0)
        ]
    }

    public toSimpleData(): SDBoard {
        const b = new SDBoard(this.id, "no-new-transaction");
        b.lists = Array.from(this.lists.items.map( (l: List) => {return l.toSimpleData();}));
        b.labels = Array.from(this.labels.values()).map( (l: Label) => {return l.toSimpleData();});
        return b
    }

    public toSerializable() {
        const b = new SerializableBoard();
        b.id = this.id
        b.name = this.name
        b.createdAt = this.createdAt
        b.lists = this.lists.items.map( (l: List) => {return l.toSerializable();});
        b.labels = Array.from(this.labels.values()).map( (l: Label) => {return l.toSerializable();});
        b.cards = Array.from(this.cards.values()).map( (c: Card) => {return c.toSerializable();});
        b.settings = this.settings
        b.attachmentStore = this.attachmentStore().descriptor.serializable((id: string)=>this.countAttachmentUsage(id))
        b.logbook = Array.from(this.logbook.values())
        return b
    }

    public static fromSerializable(s: SerializableBoard) {

        const storeDescriptor = StoreFactory.createDescriptor(s.attachmentStore)

        const b = new Board(StoreFactory.createStore(storeDescriptor)) // FIXME old version had no attachment stores... DELETE this check on product release
        b.id = s.id
        b.name = s.name
        b.createdAt = s.createdAt

        if (s.settings != undefined) { // FIXME old version had no settings... DELETE this check on product release
            Object.assign(b._settings, s.settings)
        }


        if (s.labels) { // FIXME old version had no labels... DELETE this check on product release
            b.labels.clear() // this is only needed to remove default labels, hack
            s.labels.forEach(l => b.labels.set(l.id, Label.fromSerializable(b, l)))
        }
        if (s.logbook) { // FIXME old version had no labels... DELETE this check on product release
            b.logbook.clear()
            s.logbook.filter(e=>e!=null).forEach(t => b.logbook.set(t.id, LogEntry.fromSerializable(t)))
        }

        s.lists.forEach(l => b.lists.put(List.fromSerializable(b, l)))
        s.cards.forEach(c => b.cards.set(c.id, Card.fromSerializable(b, c)))
        return b
    }


}

export class SerializableBoard {

    public lists: SerializableList[] = new Array<SerializableList>();
    public labels: SerializableLabel[] = new Array<SerializableLabel>();
    public cards: SerializableCard[] = new Array<SerializableCard>();
    public logbook = new Array<LogEntry>();
    public settings: Settings = new Settings()
    public id = "";
    public name = "";
    public createdAt = 0;
    public attachmentStore: string | object | null = null

}

