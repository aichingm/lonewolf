import { v1 as uuid } from "uuid";

import NamedIdentifiable from "@/common/NamedIdentifiable";
import { SDLabel } from "./extern/SimpleData";
import type Board from "./Board";


export default class Label extends NamedIdentifiable {

    private _color: string
    private _visibility: boolean
    //private _icon ???

    constructor() {
        super(uuid(), "")
        this._color = ""
        this._visibility = true
    }

    public get color(): string {
        return this._color
    }

    public set color(color: string) {
        this._color = color
    }

    public get visibility(): boolean {
        return this._visibility
    }

    public set visibility(visibility: boolean) {
        this._visibility = visibility
    }

    public toSerializable() {
        const l = new SerializableLabel();
        l.id = this.id
        l.name = this.name
        l.color = this.color
        l.visibility = this.visibility
        return l;
    }

    public static fromSerializable(board: Board, s: SerializableLabel) {
        const l = new Label()
        l.id = s.id
        l.name = s.name
        l.color = s.color
        l.visibility = s.visibility
        return l;
    }

    public toSimpleData(): SDLabel {
        return new SDLabel(this.id, "no-new-transaction");
    }

    public clone(): Label{
        const l = new Label()
        l.id = this.id
        l.name = this.name
        l.color = this.color
        l.visibility = this.visibility
        return l
    }

}


export class SerializableLabel {

    public id = "";
    public name = "";
    public color = "";
    public visibility = true;

}

