import type Indexable from "./Indexable";


export default class IndexedMap<T extends Indexable> {

    private _items = new Array<T>();
    private _namedItems = new Map<string, T>();


    public get items() {
        return this._items;
    }

    public get namedItems() {
        return this._namedItems;
    }

    /*public set items(items: T[]) {
        this._items = items;
    }*/

    public toArray(): Array<T>{
        const ret = new Array<T>();
        this.items.forEach((e)=>{ret.push(e)})
        return ret
    }

    public add(item: T) {
        // this method manipulates the position (reindexing)
        this.items.push(item);
        item.position = this.items.length - 1;
        this.namedItems[item.id] = item
    }

    public insert(item: T) {
        // this method manipulates the position (reindexing)
        this.items.splice(item.position, 0, item);
        this.reindex();
        this.namedItems[item.id] = item
    }

    public remove(item: T) {
        this.items.splice(item.position, 1);
        this.reindex();
        this.namedItems[item.id] = undefined
        return item;
    }

    public move(oldPos: number, newPos: number) {
        // this method manipulates the position (reindexing)
        const list = this.items[oldPos];
        this.items.splice(oldPos, 1);
        this.items.splice(newPos, 0, list);
        this.reindex();
    }

    public reindex() {
        // this method manipulates the position (reindexing)
        console.log(this.items)
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].position = i;
        }
    }

    public find(id: string) {
        return this.namedItems[id] || null
    }

    public put(t: T) {
        // remove old item from namedItems
        this.namedItems[this.items[t.position]] = undefined
        // overwrite in items
        this.items[t.position] = t
        // add new item to namedItems
        this.namedItems[t.id] = t
    }

}
