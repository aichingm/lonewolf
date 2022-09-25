import type List from "./List";

export default interface IBoard {
  id: string;
  title: string;
  lists: List[];
  addList(title: string): void;
  insertList(list: List, position: number): void;
  removeList(position: number): void;
  moveList(oldPos: number, newPos: number): void;
  reindexLists(): void;
}
