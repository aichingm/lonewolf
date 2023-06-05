

export function download(name: string, data: string, mime: string, charset?: string){
    const cs = charset || "charset=utf-8"
    const blob = new Blob([data],{type: mime + ";" + cs});
    const a = document.createElement('a');
    a.download = name;
    a.href = URL.createObjectURL(blob);
    a.click();
    a.remove();
}

export function downloadUri(name: string, uri: string){
    const a = document.createElement('a');
    a.download = name;
    a.href = uri;
    a.target = "_blank";
    a.click();
    a.remove();
}
