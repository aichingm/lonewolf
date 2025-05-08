import InlineStore, { InlineDescriptor } from "./InlineStore"
import FSStore, { FSDescriptor } from "./FileSystemStore"

export type StoreType = "inline" | "filesystem"
export type Location = string

export interface Descriptor {
    readonly storeType: StoreType;
    serializable(statCalculator: (location: string) => number): object;

}


export class Attachment {
    public name: string
    public mime: string

    constructor(name: string, mime: string){
        this.name = name
        this.mime = mime
    }

    public isImage(): boolean{
        return this.mime.startsWith("image/")
    }

}

export interface Store {
    descriptor: Descriptor;

    // backend
    shouldHandleLocation(location: Location): boolean;
    createLocation(meta: Attachment): Promise<Location>;
    pushData(location: Location, data: Uint8Array): Promise<void>;
    url(location: Location): Promise<string>;
    metadata(location: Location): Promise<Attachment>;

    //frontend

    chooseAttachment(): Promise<[Location, Attachment]>;
    updateAttachment(location: Location): Promise<Attachment>;

}

export class Factory {

    public static createStore(descriptor: Descriptor): Store {
        switch(descriptor.storeType) {
        case "inline":
            return new InlineStore(descriptor as InlineDescriptor)
        case "filesystem":
            return new FSStore(descriptor as FSDescriptor)
        default:
            return new InlineStore(new InlineDescriptor())
        }
    }

    public static createDescriptor(data: string | object | null): Descriptor {

        let descriptorType: string|null = null

        if (typeof data === 'string') {
            descriptorType = data
        } else if(data != null && typeof data === 'object' && "storeType" in data) {
            descriptorType = (data as {storeType: StoreType}).storeType
        }

        switch(descriptorType) {
        case "inline":
            return new InlineDescriptor(data)
        case "filesystem":
            return new FSDescriptor(data)
        default:
            return new InlineDescriptor()
        }
    }
}
