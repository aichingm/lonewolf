import { BoardTransaction as BaseTransaction } from "./Transaction";
import type Board from "../data/Board";
import Label from "../data/Label";
import type { Board as BoardObservable } from "../Observable";
import { Label as LabelObservable } from "../Observable";

import { v1 as uuid } from "uuid";




export abstract class LabelTransaction extends BaseTransaction {
    protected _labelId: string;

    constructor (labelId: string) {
        super()
        this._labelId = labelId
    }

    protected label(board: Board): Label {
        const label = board.findLabel(this._labelId)
        if (label == null) {
            throw new Error("Label[" + this._labelId + "] not found")
        }
        return label
    }

    public mutate(bo: BoardObservable, _board: Board): boolean {
        const  lo = bo.labels.find((l)=>l.id == this._labelId)
        if (lo == null) {
            throw new Error("Label[" + this._labelId + "] not found (SD)")
        }
        lo.version = this.id
        return true
    }

}

export class LabelChangeTransaction<Field extends keyof Label> extends LabelTransaction {
    protected _field: Field;
    protected _value: Label[Field];

    constructor (labelId: string, field: Field, value: Label[Field]) {
        super(labelId)
        this._field = field
        this._value = value
    }

    public apply(board: Board): boolean{
        console.log("LabelChangeTransaction", this._labelId, this._field, this._value)
        const label = this.label(board)
        label[this._field] = this._value
        return true
    }

}

export class NewLabelTransaction extends LabelTransaction {
    private _name: string;
    private _color: string;

    constructor (name: string, color: string) {
        super(uuid())
        this._name = name
        this._color = color
    }

    public apply(board: Board): boolean{
        console.log("NewLabelTransaction", this._labelId, this._name, this._color)
        const label = new Label(this._labelId, this._name)
        label.color = this._color
        board.labels.set(this._labelId, label)
        return true
    }

    public mutate(bo: BoardObservable, _board: Board): boolean {
        bo.labels.push(new LabelObservable(this._labelId, this.id))
        return true
    }

}

export class DeleteLabelTransaction extends LabelTransaction {

    public apply(board: Board): boolean{
        console.log("DeleteLabelTransaction", this._labelId)
        board.labels.delete(this._labelId)
        return true
    }

    public mutate(bo: BoardObservable, _board: Board): boolean {
        const  sdlIndex = bo.labels.findIndex((l)=>l.id == this._labelId)
        if (sdlIndex < 0) {
            throw new Error("Label[" + this._labelId + "] not found (SD)")
        }
        bo.labels.splice(sdlIndex, 1);
        return true
    }

}
