
import type Project from './Project'
import type { Transaction, PreferencesTransaction } from './transactions/Transaction'


export default class Extension {

    private _active = true

    public onTransaction(_p: Project, _t: Transaction){
        return
    }

    public onPreferencesTransaction(_p: Project, _t: PreferencesTransaction){
        return
    }

    public onSave(_p: Project){
        return
    }

    public onSaveAs(_p: Project){
        return
    }


    public onLoad(_p: Project){
        return
    }

    public onNew(_p: Project){
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

    public triggerOnTransaction(p: Project, t: Transaction) {
        this.extensions.forEach(e=>e.onTransaction(p, t))
    }

    public triggerOnPreferencesTransaction(p: Project, t: PreferencesTransaction) {
        this.extensions.forEach(e=>e.onPreferencesTransaction(p, t))
    }

    public triggerOnSave(p: Project) {
        this.extensions.forEach(e=>e.onSave(p))
    }

    public triggerOnSaveAs(p: Project) {
        this.extensions.forEach(e=>e.onSaveAs(p))
    }

    public triggerOnLoad(p: Project) {
        this.extensions.forEach(e=>e.onLoad(p))
    }

    public triggerOnNew(p: Project) {
        this.extensions.forEach(e=>e.onLoad(p))
    }

    public get extensions(): Extension[]{
        return this._extensions.filter(e => e.isActive())
    }

    public use(e: Extension){
        this._extensions.push(e)
    }

}
