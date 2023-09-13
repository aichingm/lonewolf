import { v4 as uuid } from "uuid";

import type { Board as BoardObservable } from "../Observable";
import type Board from "../data/Board";
import type Preferences from "../settings/Preferences";

export type TransactionTarget = "BoardTransaction"|"PreferencesTransaction"|"none"

export interface Transaction {
    target: TransactionTarget
    id: string
    createdAt: number
}

export class BaseTransaction implements Transaction{
    public target: TransactionTarget = "none"
    public createdAt: number;
    private _id: string;
    private _preventMutation = false;

    constructor () {
        this.createdAt = Date.now();
        this._id = uuid();
    }

    public get id(): string {
        return this._id;
    }

    public preventMutation(prevent?: boolean): BaseTransaction {
        this._preventMutation = prevent === undefined ? true : prevent;
        return this
    }

    public isMutationPrevented(): boolean {
        return this._preventMutation;
    }

}

export abstract class BoardTransaction extends BaseTransaction {
    public target: TransactionTarget = "BoardTransaction"
    abstract apply(b: Board): boolean
    // NOTICE keep this limitations in mind https://v2.vuejs.org/v2/guide/reactivity.html#For-Arrays
    abstract mutate(bo: BoardObservable, b: Board): boolean
}

export abstract class PreferencesTransaction extends BaseTransaction {
    public target: TransactionTarget = "PreferencesTransaction"
    abstract apply(p: Preferences): boolean
    abstract mutate(bo: Preferences): boolean
}

