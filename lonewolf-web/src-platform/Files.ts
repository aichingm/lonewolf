import { downloadUri } from '@/utils/download'

export function chooseFileAndRead(): Promise<[string, string, ArrayBuffer]>{
    return new Promise<[string, string, ArrayBuffer]>((resolve, reject)=>{
        const input = document.createElement('input');
        input.type = "file"
        input.click();

        input.addEventListener('change', (e)=>{
            const target = e.target as HTMLInputElement
            if (target == null || target.files == null) {
                return reject()
            }
            const file = target.files[0]

            const reader = new FileReader();
            reader.onload = function(e) {
                const target = e.target
                if(target != null && target.result != null) {
                    target.result
                    resolve([file.name, file.type, target.result as ArrayBuffer ]) // NOTICE this can be said because we use readAsArrayBuffer
                } else {
                    return reject()
                }
            };
            reader.readAsArrayBuffer(file); // NOTICE if this is changed the type anontation has to change too!!
        }, false);
    });
}


export function chooseFile(): Promise<[string, string, string]>{
    throw new Error("chooseFile is not implemented on browser platforms")
}

export function openFile(name: string, uri: string) {
    downloadUri(name, uri)
}
