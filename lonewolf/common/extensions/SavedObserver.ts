import { ref } from "vue";
import type { Ref } from "vue";

import type { Transaction } from "../transactions/Transaction";
import Extension from "../Extension";
import type Project from "../Project";


export default class SavedObserver extends Extension{

    private static instance: SavedObserver | null = null
    private static _localstorageKey = "savedObserver"

    public static getInstance(): SavedObserver {
        if (SavedObserver.instance == null) {
            SavedObserver.instance = new SavedObserver()
        }
        return SavedObserver.instance
    }

    private _dirty = ref(true)
    private _usePersistency = false

    public persist() {
        this._usePersistency = true
        const persistentDirty= localStorage.getItem(SavedObserver._localstorageKey)
        if (persistentDirty != null) {
            this._dirty.value = JSON.parse(persistentDirty)
        }
    }

    private persistDirtyIfEnabled(){
        if (this._usePersistency) {
            localStorage.setItem(SavedObserver._localstorageKey, JSON.stringify(this._dirty.value))
        }
    }

    public onTransaction(_p: Project, _t: Transaction){
        this.dirty()
    }

    public onNew(_p: Project){
        this.clear()
    }

    public onLoad(_p: Project){
        this.clear()
    }

    public onSave(){
        this.clear()
    }

    public onSaveAs(){
        this.clear()
    }

    public dirty(){
        this._dirty.value = false
        this.persistDirtyIfEnabled()
    }

    public clear(){
        this._dirty.value = true
        this.persistDirtyIfEnabled()
    }

    public isSavedRef(): Ref<boolean>{
        return this._dirty
    }

    public isSaved(): boolean{
        return this._dirty.value
    }

}
