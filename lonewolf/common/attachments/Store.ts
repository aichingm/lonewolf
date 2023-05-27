import InlineStore, { InlineDescriptor } from "./InlineStore"

export type StoreType = "inline"
export type Location = string

export interface Descriptor {
    readonly storeType: StoreType;
    serializable(statCalculator: (location: string) => number): object;

}

export class AttachmentMeta {
    public name = ""
    public mime = ""
}

export interface Store {
    descriptor: Descriptor;

    shouldHandleLocation(location: Location): boolean;
    createLocation(meta: AttachmentMeta): Promise<Location>;
    pushData(location: Location, data: ArrayBuffer): Promise<void>;
    url(location: Location): Promise<string>;
    metadata(location: Location): Promise<AttachmentMeta>;

}

export class Factory {

    public static createStore(descriptor: Descriptor): Store {
        switch(descriptor.storeType) {
        case "inline":
            return new InlineStore(descriptor as InlineDescriptor)
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
        default:
            return new InlineDescriptor()
        }
    }
}
