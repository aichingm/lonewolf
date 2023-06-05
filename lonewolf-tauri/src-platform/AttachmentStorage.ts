import { Factory as StoreFactory } from '@/common/attachments/Store'
import { openFile } from './Files'

export default function createAttachmentStorage(){
    return StoreFactory.createStore(StoreFactory.createDescriptor("filesystem"))
}

export function presentAttachmentActionName(){
    return "Open"
}

export function presentAttachment(name: string, uri: string){
    openFile(name, uri)
}
