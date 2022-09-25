import { v1 as uuid1 } from "uuid";

import List from "./List";

export default class Board {
    private _id: string;
    private _title: string;
    private _lists: List[];

    constructor(id: string, title: string) {
        this._id = id;
        this._title = title;
        this._lists = [];
    }

    public get id() {
        return this._id;
    }

    public set id(id: string) {
        this._id = id;
    }

    public get title() {
        return this._title;
    }

    public set title(title: string) {
        this._title = title;
    }

    public get lists() {
        return this._lists;
    }

    public set lists(lists: List[]) {
        this._lists = lists;
    }

    public addList(title: string) {
        this.lists.push(new List(uuid1(), title));
        this.lists[this.lists.length - 1].position = this.lists.length - 1;
    }

    public insertList(list: List, position: number) {
        this.lists.splice(position, 0, list);
        this.reindexLists();
    }

    public removeList(position: number) {
        const list = this.lists[position];
        this.lists.splice(position, 1);
        this.reindexLists();
        return list;
    }

    public moveList(oldPos: number, newPos: number) {
        if (oldPos < newPos) {
            newPos--;
        }
        const list = this.removeList(oldPos);
        this.insertList(list, newPos);
    }

    public reindexLists() {
        for (let i = 0; i < this.lists.length; i++) {
            this.lists[i].position = i;
        }
    }
}
