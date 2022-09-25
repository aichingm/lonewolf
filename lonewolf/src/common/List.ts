import { v1 as uuid1 } from "uuid";

import Card from "./Card";

export default class List {
    private _id: string;
    private _title: string;
    private _position: number;
    private _cards: Card[];

    constructor(id: string, title: string) {
        this._id = id;
        this._title = title;
        this._position = -1;
        this._cards = [];
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

    public get position() {
        return this._position;
    }

    public set position(position: number) {
        this._position = position;
    }

    public get cards() {
        return this._cards;
    }

    public set cards(cards: Card[]) {
        this._cards = cards;
    }

    public addCard(title: string) {
        this.cards.push(new Card(uuid1(), title));
        this.cards[this.cards.length - 1].position = this.cards.length - 1;
    }

    public insertCard(card: Card, position: number) {
        this.cards.splice(position, 0, card);
        this.reindexCards();
    }

    public removeCard(card: Card) {
        this.cards.splice(card.position, 1);
        this.reindexCards();
        return card;
    }

    public moveCard(oldPos: number, newPos: number) {
        if (oldPos < newPos) {
            newPos--;
        }
        const card = this.removeCard(this.cards[oldPos]);
        this.insertCard(card, newPos);
    }

    public reindexCards() {
        for (let i = 0; i < this.cards.length; i++) {
            this.cards[i].position = i;
        }
    }
}
