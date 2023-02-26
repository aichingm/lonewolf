import { IdentifiableTransaction } from "../Transaction";
import type { Transaction } from "../Transaction";
import type Board from "../Board";
import type { SDBoard } from "../extern/SimpleData";


type BoardField = keyof Board
type BoardFieldValue = Board[BoardField];

export class BoardTransaction extends IdentifiableTransaction  {

    constructor () {
        super()
    }

    public mutate(sdb: SDBoard, _b: Board): boolean {
        sdb.version = this.id;
        return true
    }

}

export class NewBoardTransaction extends BoardTransaction implements Transaction {

    private _createdAt: number

    constructor () {
        super()
        this._createdAt = new Date().getTime()
    }

    public apply(board: Board): boolean {
        console.log("NewBoardTransaction", board.id, this._createdAt)
        board.createdAt = this._createdAt
        return true
    }

}

export class BoardChangeTransaction extends BoardTransaction implements Transaction {
    protected _field: BoardField;
    protected _value: BoardFieldValue;

    constructor (field: BoardField, value: BoardFieldValue) {
        super()
        this._field = field
        this._value = value
    }

    public apply(board: Board): boolean{
        console.log("BoardChangeTransaction", board.id, this._field, this._value)
        Object.defineProperty(board, this._field, {value: this._value, writable: true });
        return true
    }

}
