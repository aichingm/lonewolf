import Extension from '@/common/Extension'
import type Project from '@/common/Project'
import { invoke } from "@tauri-apps/api/tauri";

export function extensions(): Extension[] {
    return [new ProjectLoadCwdSyncer()]

}

class ProjectLoadCwdSyncer extends Extension {

    public onLoad(p: Project){
        if (p.board.session.currentPath != null) {
            invoke("sync_cwd_to", { path: p.board.session.currentPath }).then(()=>{return;});
        }
    }

    public onSave(p: Project){
        if (p.board.session.currentPath != null) {
            invoke("sync_cwd_to", { path: p.board.session.currentPath }).then(()=>{return;});
        }
    }

}
