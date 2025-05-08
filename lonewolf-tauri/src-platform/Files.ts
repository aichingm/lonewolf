import { open } from "@tauri-apps/plugin-dialog"
import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs"
import type { OpenDialogOptions } from '@tauri-apps/plugin-dialog'


export function read(path: string): Promise<Uint8Array>{
    return new Promise<Uint8Array>((res, rej)=>{
        readFile(path).then((content)=>{
            res(content)
        }).catch(rej)
    })
}

export function chooseFileAndRead(properties?: OpenDialogOptions): Promise<[string, string, Uint8Array]>{
    return new Promise<[string, string, Uint8Array]>((resolve, _reject)=>{
        chooseFile(properties).then((data)=>{
            const [_name, mime, path] = data
            readFile(path).then((content)=>{
                resolve([path.split(/[\\/]/).pop() || path, mime as string, content])
            })
        })
    })
}

export function choosePathAndRead(properties?: OpenDialogOptions): Promise<[string, string, Uint8Array]>{
    return new Promise<[string, string, Uint8Array]>((resolve, _reject)=>{
        chooseFile(properties).then((data)=>{
            const [_name, mime, path] = data
            readFile(path).then((content)=>{
                resolve([path, mime as string, content])
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
