import { v4 as uuid } from "uuid";
import type { SDBoard } from "./extern/SimpleData";
import type Board from "./Board";

export interface Transaction {
    id: string
    apply(b: Board): boolean
    // NOTICE keep this limitations in mind https://v2.vuejs.org/v2/guide/reactivity.html#For-Arrays
    mutate(t: SDBoard, b: Board): boolean
}

export class BaseTransaction {
    private _created: number;
    constructor () {
        this._created = Date.now();
    }

    public created(): number {
        return this._created;
    }
}

export class IdentifiableTransaction extends BaseTransaction {
    private _id: string;
    constructor () {
        super()
        this._id = uuid();
    }

    public get id(): string {
        return this._id;
    }
}

export class MutateTransaction extends IdentifiableTransaction {

    private _preventMutation = false;

    constructor () {
        super()
    }

    public preventMutation(prevent?: boolean): MutateTransaction {
        this._preventMutation = prevent === undefined ? true : prevent;
        return this
    }

    public isMutationPrevented(): boolean {
        return this._preventMutation;
    }

}
