import { v1 as uuid } from "uuid";

import NamedIdentifiable from "@/common/NamedIdentifiable";
import { SDLabel } from "./extern/SimpleData";
import type Board from "./Board";


export default class Label extends NamedIdentifiable {

    public color: string
    public visibility: boolean
    //private _icon ???

    constructor(id: string, name: string) {
        super(uuid(), name)
        this.color = ""
        this.visibility = true
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
        const l = new Label(s.id, s.name)
        l.color = s.color
        l.visibility = s.visibility
        return l;
    }

    public toSimpleData(): SDLabel {
        return new SDLabel(this.id, "no-new-transaction");
    }

}


export class SerializableLabel {
    public id = "";
    public name = "";
    public color = "";
    public visibility = true;

}

