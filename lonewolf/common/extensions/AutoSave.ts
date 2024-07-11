
import type { Transaction } from "../transactions/Transaction";
import type PreferencesExt from "./Preferences";

import Extension from "../Extension";
import type Project from "../Project";


export default class AutoSave extends Extension{

    constructor(readonly actionHandlerReceiver: ()=>((action: string)=>void), readonly preferences: PreferencesExt){super()}

    public onTransaction(_p: Project, _t: Transaction) {
        if (this.preferences.ref.value.projectAutoSave) {
            this.actionHandlerReceiver()("save")
        }
    }

}
