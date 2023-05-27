import type { Store, StoreType, Descriptor, Location, AttachmentMeta } from "./Store"

import { v1 as uuid } from "uuid";
import { toBase64 } from "@/utils/array-buffer";


export class InlineDescriptor implements Descriptor{
    public get storeType(): StoreType{return "inline"}

    public data = new Map<string, string>()
    public attachments = new Map<string, AttachmentMeta>()

    constructor(serialized?: string | object | null) {
        if(serialized != undefined && typeof serialized == 'object' && "data" in serialized && "attachments" in serialized){
            const  serializedObject = serialized as {data: object, attachments: object}
            this.data = new Map(Object.entries(serializedObject.data));
            this.attachments = new Map(Object.entries(serializedObject.attachments));
        }
    }

    public serializable(statCalculator: (location: string) => number): object {

        for(const location of this.attachments.keys()) {
            if (statCalculator(location) == 0) {
                this.data.delete(location)
                this.attachments.delete(location)
            }
        }

        return {
            storeType: this.storeType,
            data: Object.fromEntries(this.data),
            attachments: Object.fromEntries(this.attachments),

        }
    }

}

export default class InlineStore implements Store {

    private static LOCATION_PREFIX = "attachment_"

    private _descriptor: InlineDescriptor

    constructor(descriptor: InlineDescriptor){
        this._descriptor = descriptor
    }

    public get descriptor(): Descriptor{
        return this._descriptor
    }

    public shouldHandleLocation(location: Location): boolean{
        return location.startsWith(InlineStore.LOCATION_PREFIX)
    }


    public createLocation(metaData: AttachmentMeta): Promise<Location>{
        return new Promise<Location>((resolve, _reject)=>{
            const id = InlineStore.LOCATION_PREFIX + uuid()
            this._descriptor.attachments.set(id, metaData)
            resolve(id)
        })

    }

    public pushData(location: Location, data: ArrayBuffer): Promise<void>{
        return new Promise((resolve, _reject)=>{
            this._descriptor.data.set(location, toBase64(data))
            resolve()
        })
    }

    public url(location: string): Promise<string>{
        return new Promise<string>((resolve, reject)=>{
            const data = this._descriptor.data.get(location)
            const meta = this._descriptor.attachments.get(location)
            if(data == undefined || meta == undefined) {
                return reject("404: Attachment not found")
            }
            resolve("data:" + meta.mime + ";base64," + data)
        })
    }

    public metadata(location: Location): Promise<AttachmentMeta>{
        return new Promise<AttachmentMeta>((resolve, reject)=>{
            const meta = this._descriptor.attachments.get(location)
            if(meta == undefined) {
                return reject("404: Attachment not found")
            }
            resolve(meta)
        })
    }

}
