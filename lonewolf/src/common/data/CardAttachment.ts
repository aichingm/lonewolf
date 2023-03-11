import { v1 as uuid } from "uuid";



export default class CardAttachment {
    public id: string;
    public location: string;
    public name: string;
    public mime: string;


    constructor(id: string, location: string, name: string, mime: string) {
        this.id = id;
        this.location = location;
        this.name = name;
        this.mime = mime;
    }

    public static create(location: string, name: string, mime: string): CardAttachment {
        return new CardAttachment(uuid(), location, name, mime)
    }
}

