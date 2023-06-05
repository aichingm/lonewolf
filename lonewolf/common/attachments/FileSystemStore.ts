import type { Store, StoreType, Descriptor, Location } from "./Store"
import { Attachment } from "./Store"

import { v1 as uuid } from "uuid";
import { chooseFile } from '@platform/Files'
import { Path } from '@/utils/path'

export class FSDescriptor implements Descriptor{

    public get storeType(): StoreType{return "filesystem"}

    public filesystemLocations = new Map<string, string>()
    public attachments = new Map<string, Attachment>()

    constructor(serialized?: string | object | null) {
        if(serialized != undefined && typeof serialized == 'object' && "filesystemLocations" in serialized && "attachments" in serialized){
            const  serializedObject = serialized as {filesystemLocations: object, attachments: object}
            this.filesystemLocations = new Map(Object.entries(serializedObject.filesystemLocations));
            this.attachments = new Map(Object.entries(serializedObject.attachments));
        }
    }

    public serializable(_statCalculator: (location: string) => number): object {
        return {
            storeType: this.storeType,
            filesystemLocations: Object.fromEntries(this.filesystemLocations),
            attachments: Object.fromEntries(this.attachments),
        }
    }
}

export default class FSStore implements Store {

    private static LOCATION_PREFIX = "attachment_"

    private _descriptor: FSDescriptor

    constructor(descriptor: FSDescriptor){
        this._descriptor = descriptor
    }

    public get descriptor(): Descriptor{
        return this._descriptor
    }

    public shouldHandleLocation(location: Location): boolean {
        return location.startsWith(FSStore.LOCATION_PREFIX)
    }


    public createLocation(metaData: Attachment): Promise<Location>{
        return new Promise<Location>((resolve, _reject) => {
            const id = FSStore.LOCATION_PREFIX + uuid()
            this._descriptor.attachments.set(id, metaData)
            resolve(id)
        })
    }

    public pushData(location: Location, data: ArrayBuffer): Promise<void>{
        return new Promise((resolve, reject)=>{
            const stringData = new TextDecoder().decode(data)
            const path = Path.parse(stringData)

            if(path == null){ // fail if path is not parsable
                reject()
                return
            }

            this._descriptor.filesystemLocations.set(location, stringData)
            resolve()
        })
    }

    public url(location: string): Promise<string>{
        return new Promise<string>((resolve, reject)=>{
            const data = this._descriptor.filesystemLocations.get(location)
            const meta = this._descriptor.attachments.get(location)
            if(data == undefined || meta == undefined) {
                return reject("404: Attachment not found")
            }
            resolve("fs://absolute.local" + data)
        })
    }

    public rawUrl(location: string): string{
        const data = this._descriptor.filesystemLocations.get(location)
        if(data == undefined) {
            throw new Error("404: Attachment not found")
        }
        return data
    }

    public metadata(location: Location): Promise<Attachment>{
        return new Promise<Attachment>((resolve, reject)=>{
            const meta = this._descriptor.attachments.get(location)
            if(meta == undefined) {
                return reject("404: Attachment not found")
            }
            resolve(meta)
        })
    }

    chooseAttachment(): Promise<[Location, Attachment]> {
        return new Promise<[Location, Attachment]>((resolve, _reject)=>{
            chooseFile().then((data: [string, string, string])=>{
                const [name, mime, path ] = data;
                const meta = new Attachment(name, mime)
                this.createLocation(meta).then((location: Location)=>{
                    const arrayBuffer = new TextEncoder().encode(path).buffer
                    this.pushData(location, arrayBuffer).then(()=>
                        resolve([location, meta])
                    )
                })
            })
        })
    }

    updateAttachment(location: Location): Promise<Attachment> {
        return new Promise<Attachment>((resolve, _reject)=>{
            chooseFile().then((data: [string, string, string])=>{
                const [name, mime, path ] = data;
                const meta = new Attachment(name, mime)
                const arrayBuffer = new TextEncoder().encode(path).buffer
                this.pushData(location, arrayBuffer).then(()=>{
                    this._descriptor.attachments.set(location, meta)
                    resolve(meta)
                })
            })
        })
    }

    recalculatePaths(oldProjectPath: Path|null, newProjectPath: Path) {
        const newPath = newProjectPath.dirname()
        const oldPath = oldProjectPath != null ? oldProjectPath.dirname() : null

        if (oldPath == null && !Array.from(this._descriptor.filesystemLocations.values()).every(p=>{
            const path = Path.parse(p)
            if(path != null){
                return path.isAbsolute()
            }
            return false
        })) {
            throw new Error("Old path is null but store contains relative paths")
        }


        for(const location of this._descriptor.filesystemLocations.keys()) {
            const pathStr = this._descriptor.filesystemLocations.get(location)
            if (pathStr == undefined) { // it is true that could happen if filesystemLocations is manipulated while iterating. In this case we just skip this file and go on with the next
                continue
            }

            const path = Path.parse(pathStr)
            if (path == null) { // this can happen if filesystemLocations is messed up. In this case we just skip this file and go on with the next
                continue
            }

            if(path.isAbsolute()) {
                this._descriptor.filesystemLocations.set(location, path.relativeTo(newPath).toString())
            } else {
                const newFilePath = path.toAbsolute(oldPath as Path).relativeTo(newPath) // trust me bro! if oldPath is null and !path.isAbsolute() the guard clause would have thrown an error
                this._descriptor.filesystemLocations.set(location, newFilePath.toString())
            }
        }
    }

}
