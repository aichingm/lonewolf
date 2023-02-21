import { v4 as uuid } from "uuid";
import List from "./List";
import Card from "./Card";
import Label from "./Label";
import type Settings from "./Settings";
import { SDBoard, SDList, SDCard } from "./extern/SimpleData";
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

export class NewBoardTransaction extends IdentifiableTransaction implements Transaction {

    constructor () {
        super()
    }

    public apply(board: Board): boolean {
        console.log("NewBoardTransaction", new Date().getTime())
        board.createdAt = new Date().getTime();
        return true
    }

    public mutate(t: SDBoard, _b: Board): boolean {
        t.version = this.id;
        return true
    }

}

export class BoardRenameTransaction extends IdentifiableTransaction implements Transaction {

    private _name = ""

    constructor (name: string) {
        super()
        this._name = name
    }

    public apply(board: Board): boolean {
        console.log("BoardRenameTransaction", this._name)
        board.name = this._name;
        return true
    }

    public mutate(t: SDBoard, _b: Board): boolean {
        t.version = this.id;
        return true
    }

}

export class NewListTransaction extends IdentifiableTransaction implements Transaction {
    private _title = "";
    private _listId = "";

    constructor (title: string) {
        super()
        this._title = title

    }

    public apply(board: Board): boolean {
        console.log("NewListTransaction", this._title)

        const list = List.create(board, this._title);
        this._listId = list.id
        board.lists.add(list)
        return true
    }

    public mutate(t: SDBoard, _b: Board): boolean {
        t.version = this.id
        t.lists.push(new SDList(this._listId, this.id))
        return true
    }

}

export class NewCardTransaction extends IdentifiableTransaction implements Transaction {
    private _title: string;
    private _listId: string;
    private _cardId = "";

    constructor (listId: string, title: string) {
        super()
        this._listId = listId
        this._title = title
    }

    public apply(board: Board): boolean {
        console.log("NewCardTransaction", this._listId, this._title)

        const list = board.findList(this._listId)

        if (list == null) {
            throw new Error("List[" + this._listId + "] not found")
        }

        const card = Card.create(list, this._title);
        list.cards.add(card)
        board.cards.set(card.id, card)

        this._cardId = card.id
        return true
    }

    public mutate(t: SDBoard, b: Board): boolean {
        const list = b.findList(this._listId)
        if (list == null) {
            throw new Error("List[" + this._listId + "] not found")
        }

        t.lists[list.position].cards.push(new SDCard(this._cardId, this.id))
        t.lists[list.position].version = this.id
        return true
    }

}

export class ListSortTransaction extends MutateTransaction implements Transaction{
    private _oldPosition: number;
    private _newPosition: number;
    private _listId: string;

    constructor (listId: string, oldPosition: number, newPosition: number) {
        super()
        this._listId = listId
        this._oldPosition = oldPosition
        this._newPosition = newPosition
    }

    public apply(board: Board): boolean {
        console.log("ListSortTransaction", this._listId, this._oldPosition, this._newPosition)
        board.lists.move(this._oldPosition, this._newPosition)
        return true
    }

    public mutate(t: SDBoard, _b: Board): boolean {
        if ( ! this.isMutationPrevented()) {
            const listSDBoard = t.lists[this._oldPosition]
            t.lists.splice(this._oldPosition, 1);
            t.lists.splice(this._newPosition, 0, listSDBoard);
        }

        t.version = this.id
        return true
    }

}

export class CardSortTransaction extends MutateTransaction implements Transaction {
    private _cardId: string;
    private _oldPosition: number;
    private _newPosition: number;

    constructor (cardId: string, oldPosition: number, newPosition: number) {
        super()
        this._cardId = cardId
        this._oldPosition = oldPosition
        this._newPosition = newPosition
    }

    public apply(board: Board): boolean{
        console.log("CardSortTransaction", this._cardId, this._oldPosition, this._newPosition)
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }

        card.list.cards.move(this._oldPosition, this._newPosition)
        return true
    }

    public mutate(t: SDBoard, board: Board):boolean {
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }
        const listTree = t.lists[card.list.position]
        const cardTree = listTree.cards[this._oldPosition]
        if ( ! this.isMutationPrevented()) {
            listTree.cards.splice(this._oldPosition, 1);
            listTree.cards.splice(this._newPosition, 0, cardTree);
            listTree.version = this.id
        }
        return true
    }

}

export class CardMoveTransaction extends MutateTransaction implements Transaction {
    private _cardId: string;
    private _oldPosition: number;
    private _newPosition: number;
    private _oldListId: string;
    private _newListId: string;

    constructor (cardId: string, oldListId: string, oldPosition: number, newListId: string, newPosition: number) {
        super()
        this._cardId = cardId
        this._oldListId = oldListId
        this._oldPosition = oldPosition
        this._newListId = newListId
        this._newPosition = newPosition
    }

    public apply(board: Board): boolean{
        console.log("CardMoveTransaction", this._cardId, this._oldListId, this._oldPosition, this._newListId, this._newPosition)

        const oldList = board.findList(this._oldListId)
        if (oldList == null) {
            throw new Error("List[" + this._oldListId + "] not found")
        }
        const newList = board.findList(this._newListId)
        if (newList == null) {
            throw new Error("List[" + this._newListId + "] not found")
        }
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }

        oldList.cards.remove(card);
        card.position = this._newPosition
        newList.insertCard(card);

        return true
    }

    public mutate(t: SDBoard, board: Board): boolean {

        const oldList = board.findList(this._oldListId)
        if (oldList == null) {
            throw new Error("List[" + this._oldListId + "] not found")
        }
        const newList = board.findList(this._newListId)
        if (newList == null) {
            throw new Error("List[" + this._newListId + "] not found")
        }


        const oldListTree = t.lists[oldList.position]
        const newListTree = t.lists[newList.position]

        const cardTree = this.isMutationPrevented() ? newListTree.cards[this._newPosition] : oldListTree.cards[this._oldPosition];

        if ( ! this.isMutationPrevented()) {
            oldListTree.cards.splice(this._oldPosition, 1)
            newListTree.cards.splice(this._newPosition, 0, cardTree);
        }
        cardTree.version = this.id
        newListTree.version = this.id
        oldListTree.version = this.id
        return true
    }

}

export class CardRenameTransaction extends IdentifiableTransaction implements Transaction {
    private _cardId: string;
    private _title: string;

    constructor (cardId: string, title: string) {
        super()
        this._cardId = cardId
        this._title = title

    }

    public apply(board: Board): boolean{
        console.log("CardRenameTransaction", this._cardId, this._title)
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }
        card.name = this._title
        return true
    }

    public mutate(t: SDBoard, board: Board): boolean {
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }

        const listTree = t.lists[card.list.position]
        const cardTree = listTree.cards[card.position]
        cardTree.version = this.id
        listTree.version = this.id
        return true
    }

}


export class ListChangeTransaction extends IdentifiableTransaction {

    protected _listId: string;

    constructor (listId: string) {
        super()
        this._listId = listId
    }

    public mutate(t: SDBoard, board: Board): boolean {
        const list = board.findList(this._listId)
        if (list == null) {
            throw new Error("List[" + this._listId + "] not found")
        }
        const listTree = t.lists[list.position]
        listTree.version = this.id
        t.version = this.id
        return true
    }
}

export class ListRenameTransaction extends ListChangeTransaction implements Transaction {
    private _title: string;

    constructor (listId: string, title: string) {
        super(listId)
        this._title = title
    }

    public apply(board: Board): boolean{
        console.log("ListRenameTransaction", this._listId, this._title)
        const list = board.findList(this._listId)
        if (list == null) {
            throw new Error("List[" + this._listId + "] not found")
        }
        list.name = this._title
        return true
    }

}

export class ListChangeCardsAreClosedTransaction extends ListChangeTransaction implements Transaction {
    private _value: boolean;

    constructor (listId: string, value: boolean) {
        super(listId)
        this._value = value

    }

    public apply(board: Board): boolean{
        console.log("ListChangeCardsAreClosedTransaction", this._listId, this._value)
        const list = board.findList(this._listId)
        if (list == null) {
            throw new Error("List[" + this._listId + "] not found")
        }
        list.cardsAreClosed = this._value
        return true
    }
}

export class CardDescriptionTransaction extends IdentifiableTransaction implements Transaction {
    private _cardId: string;
    private _description: string;

    constructor (cardId: string, description: string) {
        super()
        this._cardId = cardId
        this._description = description

    }

    public apply(board: Board): boolean{
        console.log("CardDescriptionTransaction", this._cardId, this._description)
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }
        card.description = this._description
        return true
    }

    public mutate(t: SDBoard, board: Board): boolean {
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }

        const listTree = t.lists[card.list.position]
        listTree.version = this.id
        const cardTree = listTree.cards[card.position]
        cardTree.version = this.id
        return true
    }

}

export class CardAddLabelTransaction extends IdentifiableTransaction implements Transaction {
    private _cardId: string;
    private _labelId: string;

    constructor (cardId: string, labelId: string) {
        super()
        this._cardId = cardId
        this._labelId = labelId

    }

    public apply(board: Board): boolean{
        console.log("CardAddLabelTransaction", this._cardId, this._labelId)
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }

        const label = board.findLabel(this._labelId)
        if (label == null) {
            throw new Error("Label[" + this._labelId + "] not found")
        }

        card.labels.push(label)
        return true
    }

    public mutate(t: SDBoard, board: Board): boolean {
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }

        const listTree = t.lists[card.list.position]
        const cardTree = listTree.cards[card.position]
        cardTree.version = this.id
        return true
    }

}

export class CardRemoveLabelTransaction extends IdentifiableTransaction implements Transaction {
    private _cardId: string;
    private _labelId: string;

    constructor (cardId: string, labelId: string) {
        super()
        this._cardId = cardId
        this._labelId = labelId

    }

    public apply(board: Board): boolean{
        console.log("CardRemoveLabelTransaction", this._cardId, this._labelId)
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }

        const label = board.findLabel(this._labelId)
        if (label == null) {
            throw new Error("Label[" + this._labelId + "] not found")
        }

        card.labels.splice(card.labels.findIndex((l)=>l.id == this._labelId), 1)

        return true
    }

    public mutate(t: SDBoard, board: Board): boolean {
        const card = board.findCard(this._cardId)
        if (card == null) {
            throw new Error("Card[" + this._cardId + "] not found")
        }

        const listTree = t.lists[card.list.position]
        const cardTree = listTree.cards[card.position]
        cardTree.version = this.id
        return true
    }

}

export class CreateLabelTransaction extends IdentifiableTransaction implements Transaction {
    private _name: string;
    private _color: string;
    private _label: Label;

    constructor (name: string, color: string) {
        super()
        this._name = name
        this._color = color
        this._label = new Label()

    }

    public apply(board: Board): boolean{
        console.log("CreateLabelTransaction", this._name, this._color)
        this._label.name = this._name
        this._label.color = this._color
        board.labels.set(this._label.id, this._label)
        return true
    }

    public mutate(t: SDBoard, _board: Board): boolean {
        const sdl = this._label.toSimpleData()
        sdl.version = this.id
        t.labels.push(sdl)
        return true
    }

}

export class LabelColorChangeTransaction extends IdentifiableTransaction implements Transaction {
    private _labelId: string;
    private _color: string;

    constructor (labelId: string, color: string) {
        super()
        this._labelId = labelId
        this._color = color
    }

    public apply(board: Board): boolean{
        console.log("LabelColorChangeTransaction", this._labelId, this._color)


        const label = board.labels.get(this._labelId)
        if (label == null) {
            throw new Error("Label[" + this._labelId + "] not found")
        }
        label.color = this._color
        return true
    }

    public mutate(t: SDBoard, _board: Board): boolean {

        const  sdl = t.labels.find((l)=>l.id == this._labelId)
        if (sdl == null) {
            throw new Error("Label[" + this._labelId + "] not found (SD)")
        }

        sdl.version = this.id

        return true
    }

}

export class DeleteLabelTransaction extends IdentifiableTransaction implements Transaction {
    private _labelId: string;

    constructor (labelId: string) {
        super()
        this._labelId = labelId
    }

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

export class LabelNameChangeTransaction extends IdentifiableTransaction implements Transaction {
    private _labelId: string;
    private _name: string;

    constructor (labelId: string, name: string) {
        super()
        this._labelId = labelId
        this._name= name
    }

    public apply(board: Board): boolean{
        console.log("LabelNameChangeTransaction", this._labelId, this._name)
        const label = board.labels.get(this._labelId)
        if (label == null) {
            throw new Error("Label[" + this._labelId + "] not found")
        }
        label.name = this._name
        return true
    }

    public mutate(t: SDBoard, _board: Board): boolean {
        const  sdl = t.labels.find((l)=>l.id == this._labelId)
        if (sdl == null) {
            throw new Error("Label[" + this._labelId + "] not found (SD)")
        }
        sdl.version = this.id
        return true
    }

}

export class LabelVisibilityChangeTransaction extends IdentifiableTransaction implements Transaction {
    private _labelId: string;
    private _visibility: boolean;

    constructor (labelId: string, visibility: boolean) {
        super()
        this._labelId = labelId
        this._visibility = visibility
    }

    public apply(board: Board): boolean{
        console.log("LabelVisibilityChangeTransaction", this._labelId, this._visibility)
        const label = board.labels.get(this._labelId)
        if (label == null) {
            throw new Error("Label[" + this._labelId + "] not found")
        }
        label.visibility = this._visibility
        return true
    }

    public mutate(t: SDBoard, _board: Board): boolean {
        const  sdl = t.labels.find((l)=>l.id == this._labelId)
        if (sdl == null) {
            throw new Error("Label[" + this._labelId + "] not found (SD)")
        }
        sdl.version = this.id
        return true
    }

}

type SettingsField = keyof typeof Settings;

export class SettingsTransaction<T> extends IdentifiableTransaction implements Transaction {
    private _field: string;
    private _value: T;


    constructor (field: string, value: T) {
        super()
        this._field = field
        this._value = value
    }

    public apply(board: Board): boolean{
        console.log("SettingsTransaction", this._field, this._value)
        const field = this._field as SettingsField;
        if (board.settings[field] == undefined) {
            throw new Error("Settings[" + this._field + "] not found")
        }

        board.settings[field] = this._value
        return true
    }

    public mutate(t: SDBoard, _board: Board): boolean {
        t.settings.version = this.id
        return true
    }

}

