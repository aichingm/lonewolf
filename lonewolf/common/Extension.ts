
import type Board from './data/Board'
import type { Transaction } from './data/Transaction'


export default class Extension {

    private _active = true

    public onTransaction(_b: Board, _t: Transaction){
        return
    }

    public onSave(_b: Board){
        return
    }

    public onSaveAs(_b: Board){
        return
    }


    public onLoad(_b: Board){
        return
    }

    public onNew(_b: Board){
        return
    }

    public activate(){
        this._active = true
    }

    public deactivate(){
        this._active = false
    }

    public isActive(){
        return this._active
    }

}

export class ExtensionManager{

    private _extensions = new Array<Extension>()

    public triggerOnTransaction(b: Board, t: Transaction) {
        this.extensions.forEach(e=>e.onTransaction(b, t))
    }

    public triggerOnSave(b: Board) {
        this.extensions.forEach(e=>e.onSave(b))
    }

    public triggerOnSaveAs(b: Board) {
        this.extensions.forEach(e=>e.onSaveAs(b))
    }

    public triggerOnLoad(b: Board) {
        this.extensions.forEach(e=>e.onLoad(b))
    }

    public triggerOnNew(b: Board) {
        this.extensions.forEach(e=>e.onLoad(b))
    }

    public get extensions(): Extension[]{
        return this._extensions.filter(e => e.isActive())
    }

    public use(e: Extension){
        this._extensions.push(e)
    }

}
