
import NamedIdentifiable from "@/common/NamedIdentifiable";
import { SDLabel } from "./extern/SimpleData";
import type Board from "./Board";


export default class Label extends NamedIdentifiable {

    public color: string
    public visibility: boolean
    public deleted: boolean


    constructor(id: string, name: string) {
        super(id, name)
        this.color = ""
        this.visibility = true
        this.deleted = false
    }

    public toSerializable() {
        const l = new SerializableLabel();
        l.id = this.id
        l.name = this.name
        l.color = this.color
        l.visibility = this.visibility
        l.deleted = this.deleted
        return l;
    }

    public static fromSerializable(board: Board, s: SerializableLabel) {
        const l = new Label(s.id, s.name)
        l.color = s.color
        l.visibility = s.visibility
        l.deleted = s.deleted
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
    public deleted = false;

}

