import { BoardTransaction as BaseTransaction } from "./Transaction";
import type Board from "../data/Board";
import type { Board as BoardObservable } from "../Observable";


export abstract class BoardTransaction extends BaseTransaction {

    constructor () {
        super()
    }


    public mutate(bo: BoardObservable, b: Board): boolean {
        bo.version = this.id;
        bo.id = b.id
        return true
    }

}

export class NewBoardTransaction extends BoardTransaction {

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

export class BoardChangeTransaction<Field extends keyof Board> extends BoardTransaction {
    protected _field: Field;
    protected _value: Board[Field];

    constructor (field: Field, value: Board[Field]) {
        super()
        this._field = field
        this._value = value
    }

    public apply(board: Board): boolean{
        console.log("BoardChangeTransaction", board.id, this._field, this._value)
        board[this._field] = this._value
        return true
    }

}
