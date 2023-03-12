
import Board from './data/Board'
import { ref } from "vue";
import type { Ref } from "vue";

export default class MostRecent {

    private static _localstorageKey = "mostRecentBoard"
    private static _failedRef = ref(false)

    public static failedRef(): Ref<boolean> {
        return MostRecent._failedRef
    }

    public static exists(): boolean {
        const mostRecentBoardString = localStorage.getItem(MostRecent._localstorageKey)
        return mostRecentBoardString != null && mostRecentBoardString.length > 0
    }

    public static put(board: Board) {
        const dataStr = JSON.stringify(board.toSerializable())
        if (new Blob([dataStr]).size <= 4000000) {
            localStorage.setItem(MostRecent._localstorageKey, dataStr)
            MostRecent._failedRef.value = false
        } else {
            localStorage.removeItem(MostRecent._localstorageKey)
            MostRecent._failedRef.value = true
        }
    }

    public static load(): Board | null {
        if(MostRecent.exists()) {
            return Board.fromSerializable(JSON.parse(localStorage.getItem(MostRecent._localstorageKey) as string))
        }
        return null
    }

}
