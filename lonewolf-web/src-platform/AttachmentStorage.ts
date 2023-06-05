import { Factory as StoreFactory } from '@/common/attachments/Store'
import { openFile } from './Files'

export default function createAttachmentStorage(){
    return StoreFactory.createStore(StoreFactory.createDescriptor("inline"))
}

export function presentAttachmentActionName(){
    return "Download"
}

export function presentAttachment(name: string, uri: string){
    openFile(name, uri)
}
