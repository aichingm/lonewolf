import { ref } from "vue";

import type { PreferencesTransaction } from "../transactions/Transaction";
import Extension from "../Extension";
import Preferences from "../settings/Preferences";
import type Project from "../Project";

import { preferencesStorage } from '@/platform/Functions'



export default class PreferencesLoader extends Extension {

    public ref = ref(new Preferences())

    private storage = preferencesStorage()

    private save(projectId: string){
        this.storage.save(projectId, this.ref.value)
    }

    private load(projectId: string){
        this.storage.load(projectId).then(pref => this.ref.value = pref)
    }

    public onPreferencesTransaction(project: Project, _t: PreferencesTransaction){
        this.save(project.board.id)
    }

    public onSave(project: Project){
        this.save(project.board.id)
    }

    public onSaveAs(project: Project){
        this.save(project.board.id)
    }

    public onNew(_project: Project){
        this.ref.value = new Preferences()
    }

    public onLoad(project: Project){
        this.load(project.board.id)
    }



}
