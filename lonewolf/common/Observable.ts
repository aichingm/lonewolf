import { v4 as uuid } from "uuid";

export class Observable {
    public id = "";
    public version = "";

    constructor (id: string, version: string) {
        this.id = id;
        this.version = version;
    }

    public reset() {
        this.version = uuid()
    }

    public assign(o: Observable) {
        this.id = o.id
        this.version = o.version
    }
}

export class ObservableHolder<T extends Observable> extends Observable{
    public value: T

    constructor (value: T, id?: string, version?: string) {
        super(id || "holder(" + value.id + ")", version || "holder(" + value.version + ")")
        this.value = value
    }

}

export class Board extends Observable{
    public lists = new Array<List>();
    public cardArchive = new List("Archive", uuid());
    public listArchive = new Array<List>();
    public labels = new ObservableArray("labels", uuid(), [] as Label[]);
    public settings = new Observable("settings", uuid());

    public reset() {
        super.reset()
        this.lists.splice(0, this.lists.length)
        this.labels.reset()
        this.settings.version = uuid()
    }

}

export class List extends Observable{
    public cards = new Array<Card>();

    public reset() {
        super.reset()
        this.cards.splice(0, this.cards.length)
    }

    public assign(o: List) {
        super.assign(o)
        this.cards = o.cards
    }


}

export class ObservableArray<T> extends Observable{
    public items = new Array<T>();

    constructor (id: string, version: string, items: Array<T>) {
        super(id, version)
        this.items = items
    }

    public reset() {
        super.reset()
        this.items.splice(0, this.items.length)
    }

    public assign(o: ObservableArray<T>) {
        super.assign(o)
        this.items = o.items
    }


}


export class Card extends Observable{

}

export class Label  extends Observable{

}
