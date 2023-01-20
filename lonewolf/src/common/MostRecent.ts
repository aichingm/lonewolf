
import Board from './data/Board'

export default class MostRecent {

    private static _localstorageKey = "mostRecentBoard"

    public static exists(): boolean {
        const mostRecentBoardString = localStorage.getItem(MostRecent._localstorageKey)
        return mostRecentBoardString != null && mostRecentBoardString.length > 0
    }

    public static put(board: Board) {
        localStorage.setItem("mostRecentBoard", JSON.stringify(board.toSerializable())) // localstorage
    }

    public static load(): Board | null {
        if(MostRecent.exists()) {
            return Board.fromSerializable(JSON.parse(localStorage.getItem(MostRecent._localstorageKey) as string))
        }
        return null
    }

}
