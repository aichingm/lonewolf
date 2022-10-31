import type Indexable from "./Indexable";


export default class IndexedMap<T extends Indexable> {

    private _items = new Array<T>();


    public get items() {
        return this._items;
    }

    public set items(items: T[]) {
        this._items = items;
    }

    public toArray(): Array<T>{
        const ret = new Array<T>();
        this.items.forEach((e)=>{ret.push(e)})
        return ret
    }

    public add(item: T) {
        this.items.push(item);
        item.position = this.items.length - 1;
    }

    public insert(item: T, position: number) {
        this.items.splice(position, 0, item);
        this.reindex();
    }

    public remove(item: T) {
        this.items.splice(item.position, 1);
        this.reindex();
        return item;
    }

    public move(oldPos: number, newPos: number) {
        if (oldPos < newPos) {
            newPos--;
        }
        const item = this.remove(this.items[oldPos]);
        this.insert(item, newPos);
    }

    public reindex() {
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].position = i;
        }
    }

    public find(id: string) {
        for (const item of this.items) {
            if (item.id == id)
                return item
        }
        return null
    }

}
