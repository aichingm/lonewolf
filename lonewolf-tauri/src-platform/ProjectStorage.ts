import type { IStorage, IStorageEntry } from '@/common/storage/Storage'
import type FSStore from '@/common/attachments/FileSystemStore'
import { choosePathAndRead } from './Files'
import Board from '@/common/data/Board'
import { save } from '@tauri-apps/api/dialog';
import { writeTextFile } from '@tauri-apps/api/fs';
import { Path } from '@/utils/path'
import { v1 as uuid } from "uuid";

export class ProjectStorage implements IStorage {

    public save(board: Board): Promise<void> {
        if (board.session.currentPath != null) {
            const savePath = board.session.currentPath as string
            return new Promise((resolve, reject)=>{
                if (board.attachmentStore().descriptor.storeType == "filesystem") {
                    const store = board.attachmentStore() as FSStore
                    const newPath = Path.parse(savePath)
                    if (newPath != null) {
                        store.recalculatePaths(Path.parse(savePath), newPath)
                    } else {
                        throw new Error("Failed to parse save path")
                    }
                }
                writeTextFile(savePath, JSON.stringify(board.toSerializable())).then(resolve).catch(reject);
            })
        } else {
            // this can happen if a new board is about to be saved and has no board.session.currentPath yet
            return new Promise((resolve, reject)=>{
                save({ defaultPath: board.session.currentPath || (board.name + ".lwp"), filters: [{ name: 'Lonewolf Project', extensions: ['lwp'] }]}).then((path)=>{
                    if(path != null) {
                        if (board.attachmentStore().descriptor.storeType == "filesystem") {
                            const store = board.attachmentStore() as FSStore
                            const newPath = Path.parse(path)
                            if (newPath != null) {
                                store.recalculatePaths(Path.parse(board.session.currentPath||""), newPath)
                            } else {
                                throw new Error("Failed to parse save path")
                            }
                        }
                        board.session.currentPath = path
                        writeTextFile(path, JSON.stringify(board.toSerializable())).then(resolve).catch(reject);
                    }else{
                        reject()
                    }
                }).catch(reject);
            })
        }
    }

    public saveAs(board: Board): Promise<string> {
        return new Promise((resolve, reject)=>{
            save({ defaultPath: board.session.currentPath || (board.name + ".lwp"), filters: [{ name: 'Lonewolf Project', extensions: ['lwp'] }]}).then((path)=>{
                if(path != null) {
                    if (board.attachmentStore().descriptor.storeType == "filesystem") {
                        const store = board.attachmentStore() as FSStore
                        const newPath = Path.parse(path)
                        if (newPath != null) {
                            store.recalculatePaths(Path.parse(board.session.currentPath||""), newPath)
                        } else {
                            throw new Error("Failed to parse save path")
                        }
                    }
                    const newUuid = uuid()
                    board.id = newUuid
                    board.session.currentPath = path
                    writeTextFile(path, JSON.stringify(board.toSerializable())).then(()=>resolve(newUuid)).catch(reject);
                }
            }).catch(reject);
        })
    }

    public load(): Promise<Board> {
        return new Promise((resolve, reject)=>{
            const properties = {
                defaultPath: '~',
                directory: false,
                filters: [{
                    extensions: ['lwp'], name: "Lonewolf Project"
                }]
            };
            choosePathAndRead(properties).then((data)=>{
                const [path, _mime, buffer] = data
                const jsonString = new TextDecoder("utf-8").decode(buffer)
                const board = Board.fromSerializable(JSON.parse(jsonString))
                board.session.currentPath = path
                resolve(board)
            }).catch(reject)
        })
    }

    public list(): Promise<IStorageEntry[]> {
        return new Promise<IStorageEntry[]>((_resolve, reject)=>{
            reject()
        })
    }

    public isListable(): boolean {
        return false
    }

}
