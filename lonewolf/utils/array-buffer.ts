

export function toBase64(buffer: ArrayBuffer): string {
    return btoa(new Uint8Array(buffer).reduce((a: string[], v)=>{a.push(String.fromCharCode(v)); return a}, [] as string[]).join(""))
}

export function fromBase64(encoded: string): ArrayBuffer {
    return new TextEncoder().encode(atob(encoded)).buffer
}

export function arrayBuffer(data: string) {
    return new TextEncoder().encode(data).buffer
}
