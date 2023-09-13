import type Board from "./data/Board";

export default class Project {
    public board: Board
    constructor(board: Board){
        this.board = board;
    }
}
