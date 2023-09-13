import { BoardTransaction as BaseTransaction } from "./Transaction";
import type Board from "../data/Board";
import List from "../data/List";
import type { Board as BoardObservable } from "../Observable";
import { List as ListObservable } from "../Observable";

import { Entry as LogEntry, Kind as LogKind, Action as LogAction } from "../logs/LogEntry";

import { v1 as uuid } from "uuid";


export abstract class ListTransaction extends BaseTransaction {
    protected _listId: string;

    constructor (listId: string) {
        super()
        this._listId = listId
    }

    protected list(board: Board, ): List {
        const list = board.findListInclArchives(this._listId)
        if (list == null) {
            throw new Error("List[" + this._listId + "] not found")
        }
        return list
    }



    public mutate(bo: BoardObservable, board: Board): boolean {
        const list = this.list(board)
        const listTree = bo.lists[list.position]
        listTree.version = this.id
        bo.version = this.id
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

export class ListChangeTransaction<Field extends keyof List> extends ListTransaction {
    protected _field: Field;
    protected _value: List[Field];

    constructor (listId: string, field: Field, value: List[Field]) {
        super(listId)
        this._field = field
        this._value = value
    }

    public apply(board: Board): boolean{
        console.log("ListChangeTransaction", this._listId, this._field, this._value)
        const list = this.list(board)
        list[this._field] = this._value

        this.applyLogEntry(board, this.defaultLogEntry()
            .setAction(LogAction.Change)
            .setObjectId(this._field)
            .setObjectKind(LogKind.Property)
            .setArguments(this._value+""))

        return true
    }

}

export class NewListTransaction extends ListTransaction {
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

    public mutate(bo: BoardObservable, _b: Board): boolean {
        bo.version = this.id
        bo.lists.push(new ListObservable(this._listId, this.id))
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

    public mutate(bo: BoardObservable, _b: Board): boolean {
        if ( ! this.isMutationPrevented()) {
            const listBo = bo.lists[this._oldPosition]
            bo.lists.splice(this._oldPosition, 1);
            bo.lists.splice(this._newPosition, 0, listBo);
        }

        bo.version = this.id
        return true
    }

}

enum ArchiveDirection {
    Archive,
    Unarchive,
}

export class ListArchiveTransaction extends ListTransaction {

    public static Archive = ArchiveDirection.Archive
    public static Unarchive = ArchiveDirection.Unarchive

    private _direction: ArchiveDirection
    private _position: number

    constructor (listId: string, position: number, direction: ArchiveDirection) {
        super(listId)
        this._direction = direction
        this._position = position
    }

    public apply(board: Board): boolean {
        console.log("ListArchiveTransaction", this._listId, this._direction)
        const list = this.list(board)
        if (this._direction == ArchiveDirection.Archive) {
            board.lists.remove(list)
            board.listArchive.add(list)
        } else {
            board.listArchive.remove(list)
            board.lists.add(list)
        }
        this.applyLogEntry(board, this.defaultLogEntry()
            .setAction(LogAction.Change)
            .setObjectId("archived")
            .setObjectKind(LogKind.Property)
            .setArguments((this._direction == ArchiveDirection.Archive).toString()))
        return true
    }

    public mutate(bo: BoardObservable, _b: Board): boolean {
        if (this._direction == ArchiveDirection.Archive) {
            const listBo = bo.lists[this._position]
            bo.listArchive.push(listBo);
            bo.lists.splice(this._position, 1);
            listBo.version = this.id
        } else {
            const listBo = bo.listArchive[this._position]
            bo.listArchive.splice(this._position, 1);
            bo.lists.push(listBo);
            listBo.version = this.id
        }
        bo.version = this.id
        return true
    }

}
