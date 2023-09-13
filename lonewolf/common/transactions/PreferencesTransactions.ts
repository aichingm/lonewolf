import { PreferencesTransaction as BaseTransaction } from "./Transaction";

import type Preferences from "../settings/Preferences";


export class PreferencesChangeTransaction<Field extends keyof Preferences> extends BaseTransaction {
    protected _field: Field;
    protected _value: Preferences[Field];

    constructor (field: Field, value: Preferences[Field]) {
        super()
        this._field = field
        this._value = value
    }

    public apply(_preferences: Preferences): boolean{
        console.log("PreferencesChangeTransaction", this._field, this._value)
        // don't mutate here or else vues optimisation of the proxy checks if the new value is different to the old one and only then marks as dirty
        return true
    }

    public mutate(p: Preferences): boolean {
        p[this._field] = this._value 
        return true
    }

}

