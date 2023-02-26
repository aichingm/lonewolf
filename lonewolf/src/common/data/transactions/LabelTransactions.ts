import { MutateTransaction } from "../Transaction";
import type { Transaction } from "../Transaction";
import type Board from "../Board";
import Label from "../Label";
import type { SDBoard } from "../extern/SimpleData";
import { SDLabel } from "../extern/SimpleData";

import { v1 as uuid } from "uuid";



type LabelField = keyof Label
type LabelFieldValue = Label[LabelField];

export class LabelTransaction extends MutateTransaction {
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

    public mutate(sdb: SDBoard, _board: Board): boolean {
        const  sdl = sdb.labels.find((l)=>l.id == this._labelId)
        if (sdl == null) {
            throw new Error("Label[" + this._labelId + "] not found (SD)")
        }
        sdl.version = this.id
        return true
    }

}

export class LabelChangeTransaction extends LabelTransaction implements Transaction {
    protected _field: LabelField;
    protected _value: LabelFieldValue;

    constructor (labelId: string, field: LabelField, value: LabelFieldValue) {
        super(labelId)
        this._field = field
        this._value = value
    }

    public apply(board: Board): boolean{
        console.log("LabelChangeTransaction", this._labelId, this._field, this._value)
        const label = this.label(board)
        Object.defineProperty(label, this._field, {value: this._value, writable: true });
        return true
    }

}

export class NewLabelTransaction extends LabelTransaction implements Transaction {
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

    public mutate(board: SDBoard, _board: Board): boolean {
        board.labels.push(new SDLabel(this._labelId, this.id))
        return true
    }

}

export class DeleteLabelTransaction extends LabelTransaction {

    public apply(board: Board): boolean{
        console.log("DeleteLabelTransaction", this._labelId)
        board.labels.delete(this._labelId)
        return true
    }

    public mutate(t: SDBoard, _board: Board): boolean {
        const  sdlIndex = t.labels.findIndex((l)=>l.id == this._labelId)
        if (sdlIndex < 0) {
            throw new Error("Label[" + this._labelId + "] not found (SD)")
        }
        t.labels.splice(sdlIndex, 1);
        return true
    }

}
