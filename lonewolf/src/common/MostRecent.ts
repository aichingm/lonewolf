
import Board from './data/Board'
import { ref } from "vue";
import type { Ref } from "vue";

import type { Transaction } from "./data/Transaction";
import Extension from "./Extension";


export default class MostRecent extends Extension {

    private _localstorageKey = "mostRecentBoard"
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
            this._failedRef.value = false
        } else {
            localStorage.removeItem(this._localstorageKey)
            this._failedRef.value = true
        }
    }

    public load(): Board | null {
        if(this.exists()) {
            return Board.fromSerializable(JSON.parse(localStorage.getItem(this._localstorageKey) as string))
        }
        return null
    }

    public onTransaction(board: Board, _t: Transaction){
        this.put(board)
    }

    public onNew(board: Board){
        this.put(board)
    }

    public onLoad(board: Board){
        this.put(board)
    }



}
