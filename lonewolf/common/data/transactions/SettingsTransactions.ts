import { IdentifiableTransaction } from "../Transaction";
import type { Transaction } from "../Transaction";

import type Settings from "../Settings";
import type { SDBoard } from "../extern/SimpleData";
import type Board from "../Board";

type SettingsField = keyof Settings
type SettingsFieldValue = Settings[SettingsField];

export class SettingsChangeTransaction extends IdentifiableTransaction implements Transaction {
    protected _field: SettingsField;
    protected _value: SettingsFieldValue;

    constructor (field: SettingsField, value: SettingsFieldValue) {
        super()
        this._field = field
        this._value = value
    }

    public apply(board: Board): boolean{
        console.log("SettingsChangeTransaction", this._field, this._value)
        Object.defineProperty(board.settings, this._field, {value: this._value, writable: true });
        return true
    }

    public mutate(t: SDBoard, _board: Board): boolean {
        t.settings.version = this.id
        return true
    }

}
