import type { IStorage, IStorageEntry } from '@/common/storage/Storage'
import Board from '@/common/data/Board'
import { DialogManager } from './Dialogs'
import { v1 as uuid } from "uuid";

export class ProjectStorage implements IStorage {

    public save(board: Board): Promise<void> {
        return new Promise((resolve, _reject)=>{
            const serializableBoard = JSON.stringify(board.toSerializable())
            const blob = new Blob([serializableBoard],{type:"text/plain;charset=utf-8"});
            const a = document.createElement('a');
            a.download = board.session.currentPath || (board.name + ".lwp");
            a.href = window.URL.createObjectURL(blob);
            a.click();
            a.remove();
            resolve()
        })
    }

    public saveAs(board: Board): Promise<string> {
        return new Promise((resolve, reject)=>{
            DialogManager.getInstance().saveAs("lwp").then((filename) => {
                const newUuid = uuid()
                board.id = newUuid
                const serializableBoard = JSON.stringify(board.toSerializable())
                const blob = new Blob([serializableBoard],{type:"text/plain;charset=utf-8"});
                const a = document.createElement('a');
                a.download = filename
                a.href = window.URL.createObjectURL(blob);
                a.click();
                a.remove();
                board.session.currentPath = filename
                resolve(newUuid)
            }).catch(reject)
        })
    }

    public load(): Promise<Board> {
        return new Promise((resolve, _reject)=>{

            const input = document.createElement('input');
            input.type = "file"
            input.click();

            input.addEventListener('change', (e)=>{
                const target = <HTMLInputElement> e.target
                if (target == null || target.files == null) {
                    return;
                }
                const file = target.files[0]
                const reader = new FileReader();
                reader.onload = function(e) {
                    const target = e.target
                    if(target != null && target.result != null){
                        const board = Board.fromSerializable(JSON.parse(unbuff(target.result)))
                        board.session.currentPath = file.name
                        resolve(board)
                    }
                };
                reader.readAsText(file);
            }, false);

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

function unbuff(data: string | ArrayBuffer): string {
    if ((typeof data) == "string") {
        return <string> data
    } else {
        return new TextDecoder("utf-8").decode(<ArrayBuffer>data);
    }
}
