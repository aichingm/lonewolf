import { h, ref } from 'vue'
import { NInput } from 'naive-ui'
import type { DialogProviderInst } from 'naive-ui'

export class DialogManager {

    public static instance: DialogManager|null = null;

    public static initialize(dialog: DialogProviderInst){
        DialogManager.instance = new DialogManager(dialog);
    }

    public static getInstance() {
        if ( DialogManager.instance == null ) {
            throw new Error("DialogManager is not initialized")
        }
        return DialogManager.instance
    }

    private dialog: DialogProviderInst

    constructor(dialog: DialogProviderInst) {
        this.dialog = dialog
    }
    
    public saveAs(extension: string): Promise<string>{
        return new Promise((res, rej) => {
            const filename = ref("")
            this.dialog.info({
                title: 'Save As',
                content: () => h(NInput, { 
                    placeholder: "Name",
                    value: filename.value,
                    "on-update:value": (x: string)=>filename.value=x 
                }, { 
                    suffix: () => "." + extension
                }),
                positiveText: 'Save',
                negativeText: 'Cancel',
                onPositiveClick: () => res(filename.value + "." + extension),
                onNegativeClick: () => rej()
            })
        })
    }
} 
