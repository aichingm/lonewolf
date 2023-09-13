import { BoardTransaction as BaseTransaction } from "./Transaction";

import type Settings from "../data/Settings";
import type Board from "../data/Board";
import type { Board as BoardObservable } from "../Observable";


export class SettingsChangeTransaction<Field extends keyof Settings> extends BaseTransaction {
    protected _field: Field;
    protected _value: Settings[Field];

    constructor (field: Field, value: Settings[Field]) {
        super()
        this._field = field
        this._value = value
    }

    public apply(board: Board): boolean{
        console.log("SettingsChangeTransaction", this._field, this._value)
        board.settings[this._field] = this._value
        return true
    }

    public mutate(bo: BoardObservable, _board: Board): boolean {
        bo.settings.version = this.id
        return true
    }

}

