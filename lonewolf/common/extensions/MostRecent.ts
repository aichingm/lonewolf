import { ref } from "vue";
import type { Ref } from "vue";

import Board from '../data/Board'
import type { Transaction } from "../transactions/Transaction";
import Extension from "../Extension";
import type Project from "../Project";


export default class MostRecent extends Extension {

    private _localstorageKey = "mostRecentBoard"
    private _localstorageSessionDataKey = "mostRecentBoardSession"
    private _failedRef = ref(false)

    public failedRef(): Ref<boolean> {
        return this._failedRef
    }

    public exists(): boolean {
        const mostRecentBoardString = localStorage.getItem(this._localstorageKey)
        return mostRecentBoardString != null && mostRecentBoardString.length > 0
    }

    public put(board: Board) {
        const dataStr = JSON.stringify(board.toSerializable())
        if (new Blob([dataStr]).size <= 4000000) {
            localStorage.setItem(this._localstorageKey, dataStr)
            localStorage.setItem(this._localstorageSessionDataKey, JSON.stringify(board.session))
            this._failedRef.value = false
        } else {
            localStorage.removeItem(this._localstorageKey)
            this._failedRef.value = true
        }
    }

    public load(): Promise<Board> {
        return new Promise((res, rej)=>{
            if(this.exists()) {
                const board = Board.fromSerializable(JSON.parse(localStorage.getItem(this._localstorageKey) as string))
                board.session = JSON.parse(localStorage.getItem(this._localstorageSessionDataKey) as string)
                res(board)
            }else {
                rej()
            }
        })
    }

    public onTransaction(project: Project, _t: Transaction){
        this.put(project.board)
    }

    public onNew(project: Project){
        this.put(project.board)
    }

    public onLoad(project: Project){
        this.put(project.board)
    }

}
