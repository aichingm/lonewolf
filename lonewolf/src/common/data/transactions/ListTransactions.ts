import { MutateTransaction } from "../Transaction";
import type { Transaction } from "../Transaction";
import type Board from "../Board";
import List from "../List";
import type { SDBoard } from "../extern/SimpleData";
import { SDList } from "../extern/SimpleData";

import { Entry as LogEntry, Kind as LogKind, Action as LogAction } from "../../logs/LogEntry";

import { v1 as uuid } from "uuid";


type ListField = keyof List
type ListFieldValue = List[ListField];

export class ListTransaction extends MutateTransaction {
    protected _listId: string;

    constructor (listId: string) {
        super()
        this._listId = listId
    }

    protected list(board: Board, ): List {
        const list = board.findList(this._listId)
        if (list == null) {
            throw new Error("List[" + this._listId + "] not found")
        }
        return list
    }

    public mutate(sdb: SDBoard, board: Board): boolean {
        const list = this.list(board)
        const listTree = sdb.lists[list.position]
        listTree.version = this.id
        sdb.version = this.id
        return true
    }

    public defaultLogEntry(): LogEntry {
        return (new LogEntry())
            .setTimestamp(this.createdAt)
            .setInitiator("self")
            .setSubjectKind(LogKind.List)
            .setSubjectId(this._listId)
    }

    public applyLogEntry(board: Board, logEntry: LogEntry) {
        this.list(board).logbook.push(logEntry.id)
        board.logbook.set(logEntry.id, logEntry)
    }

}

export class ListChangeTransaction extends ListTransaction implements Transaction {
    protected _field: ListField;
    protected _value: ListFieldValue;

    constructor (listId: string, field: ListField, value: ListFieldValue) {
        super(listId)
        this._field = field
        this._value = value
    }

    public apply(board: Board): boolean{
        console.log("ListChangeTransaction", this._listId, this._field, this._value)
        const list = this.list(board)
        Object.defineProperty(list, this._field, {value: this._value, writable: true });

        this.applyLogEntry(board, this.defaultLogEntry()
            .setAction(LogAction.Change)
            .setObjectId(this._field)
            .setObjectKind(LogKind.Property)
            .setArguments(this._value+""))

        return true
    }

}

export class NewListTransaction extends ListTransaction implements Transaction {
    private _title = "";

    constructor (title: string) {
        super(uuid())
        this._title = title

    }

    public apply(board: Board): boolean {
        console.log("NewListTransaction", this._listId, this._title)

        const list = new List(board, this._listId, this._title);
        board.lists.add(list)

        this.applyLogEntry(board, this.defaultLogEntry()
            .setAction(LogAction.Create)
            .setArguments(this._listId, this._title))

        return true
    }

    public mutate(t: SDBoard, _b: Board): boolean {
        t.version = this.id
        t.lists.push(new SDList(this._listId, this.id))
        return true
    }

}

export class ListSortTransaction extends ListTransaction {
    private _oldPosition: number;
    private _newPosition: number;

    constructor (listId: string, oldPosition: number, newPosition: number) {
        super(listId)
        this._oldPosition = oldPosition
        this._newPosition = newPosition
    }

    public apply(board: Board): boolean {
        console.log("ListSortTransaction", this._listId, this._oldPosition, this._newPosition)
        board.lists.move(this._oldPosition, this._newPosition)
        return true
    }

    public mutate(t: SDBoard, _b: Board): boolean {
        if ( ! this.isMutationPrevented()) {
            const listSDBoard = t.lists[this._oldPosition]
            t.lists.splice(this._oldPosition, 1);
            t.lists.splice(this._newPosition, 0, listSDBoard);
        }

        t.version = this.id
        return true
    }

}
