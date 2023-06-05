import Extension from '@/common/Extension'
import type Board from '@/common/data/Board'
import { invoke } from "@tauri-apps/api/tauri";

export function extensions(): Extension[] {
    return [new ProjectLoadCwdSyncer()]

}

class ProjectLoadCwdSyncer extends Extension {

    public onLoad(b: Board){
        if (b.session.currentPath != null) {
            invoke("sync_cwd_to", { path: b.session.currentPath }).then(()=>{return;});
        }
    }

    public onSave(b: Board){
        if (b.session.currentPath != null) {
            invoke("sync_cwd_to", { path: b.session.currentPath }).then(()=>{return;});
        }
    }

}
