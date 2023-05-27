import type { IStorage, IStorageEntry } from '@/common/storage/Storage'
import Board from '@/common/data/Board'

export class ProjectStorage implements IStorage {

    public save(board: Board): Promise<void> {
        return new Promise((resolve, _reject)=>{
            (async () => {
                const { save } = await import('@tauri-apps/api/dialog');
                const path = await save({
                    filters: [{
                        name: 'Imag11e',
                        extensions: ['lwp']
                    }]
                });
                if(path != null){
                    const { writeTextFile } = await import('@tauri-apps/api/fs');
                    await writeTextFile(path, JSON.stringify(board.toSerializable()));
                    resolve()
                }
            })()
        })
    }

    public load(_data: string): Promise<Board> {
        return new Promise((resolve, _reject)=>{

            const properties = {
                defaultPath: '~',
                directory: false,
                filters: [{
                    extensions: ['lwp'], name: "*"
                }]
            };

            (async () => {
                const { open } = await import("@tauri-apps/api/dialog")
                const { readTextFile } = await import("@tauri-apps/api/fs")
                const path = await open(properties)
                if(path != null && path && !Array.isArray(path)){
                    const jsonString = await readTextFile(path)
                    const board = Board.fromSerializable(JSON.parse(jsonString))
                    resolve(board)
                }
            })()
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
