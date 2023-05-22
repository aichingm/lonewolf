import type { IStorage, IStorageEntry } from '@/common/storage/Storage'
import Board from '@/common/data/Board'

export class BrowserNativeStorage implements IStorage {

    public save(board: Board): Promise<void> {
        return new Promise((resolve, _reject)=>{
            const serializableBoard = JSON.stringify(board.toSerializable())
            const blob = new Blob([serializableBoard],{type:"text/plain;charset=utf-8"});
            const a = document.createElement('a');
            a.download = board.name + ".lwp";
            a.href = window.URL.createObjectURL(blob);
            a.click();
            a.remove();
            resolve()
        })
    }

    public load(_data: string): Promise<Board> {
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
