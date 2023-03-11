

export function toBase64(buffer: ArrayBuffer): string {
    return btoa(new Uint8Array(buffer).reduce((a: string[], v)=>{a.push(String.fromCharCode(v)); return a}, [] as string[]).join(""))
}
