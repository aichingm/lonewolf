import { open } from "@tauri-apps/api/dialog"
import { invoke } from "@tauri-apps/api/tauri";
import { readBinaryFile } from "@tauri-apps/api/fs"
import type { OpenDialogOptions } from '@tauri-apps/api/dialog'

export function chooseFileAndRead(properties?: OpenDialogOptions): Promise<[string, string, ArrayBuffer]>{
    return new Promise<[string, string, ArrayBuffer]>((resolve, _reject)=>{
        chooseFile(properties).then((data)=>{
            const [_name, mime, path] = data
            readBinaryFile(path).then((content)=>{
                resolve([path.split(/[\\/]/).pop() || path, mime as string, content.buffer])
            })
        })
    })
}

export function choosePathAndRead(properties?: OpenDialogOptions): Promise<[string, string, ArrayBuffer]>{
    return new Promise<[string, string, ArrayBuffer]>((resolve, _reject)=>{
        chooseFile(properties).then((data)=>{
            const [_name, mime, path] = data
            readBinaryFile(path).then((content)=>{
                resolve([path, mime as string, content.buffer])
            })
        })
    })
}

export function chooseFile(properties?: OpenDialogOptions): Promise<[string, string, string]> {
    return new Promise((resolve, reject)=>{
        if(properties == undefined){
            properties = {
                defaultPath: '~',
                directory: false,
            }
        }
        open(properties).then((path)=>{
            if(path != null && path && !Array.isArray(path)) {
                invoke("mime", { path: path }).then((mime)=>{
                    resolve([path.split(/[\\/]/).pop() || path, mime as string, path])
                });
            } else {
                reject()
            }
        })
    })
}

export function openFile(_name: string, uri: string) {
    invoke("open_file", { uri: uri }).then(()=>{return});
}
