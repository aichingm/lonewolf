import { v1 as uuid } from "uuid";



export default class CardAttachment {
    public id: string;
    public location: string;
    public name: string;
    public mime: string;
    public deleted: boolean;



    constructor(id: string, location: string, name: string, mime: string, deleted: boolean) {
        this.id = id;
        this.location = location;
        this.name = name;
        this.mime = mime;
        this.deleted = deleted;
    }

    public static create(location: string, name: string, mime: string, deleted: boolean): CardAttachment {
        return new CardAttachment(uuid(), location, name, mime, deleted)
    }

}

