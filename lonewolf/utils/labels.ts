
import { nameToHex, hexToHsl } from "@/utils/colors";

export function themeOverwrite(color: string){
    return {common: { closeIconColor: nameToHex(color)}}
}

function lighten(hslParts: number[]) {
    hslParts[2] = Math.max(Math.min(40 + 93/100*hslParts[2], 99), 0)
    return  hslParts
}

export function tagColor(color: string){
    const hex = nameToHex(color)
    const hsla = hexToHsl(hex, lighten )
    return {color: hsla, borderColor:hex, textColor: hex}
}


export function labelStyle(color: string){
    const hex = nameToHex(color)
    const hsla = hexToHsl(hex, lighten)
    return "color: " + hex + ";" + "background-color:" + hsla + ";" + "border-color:" + hex + ";"
}

export function labelStyleImportant(color:string){
    const hex = nameToHex(color)
    const hsla = hexToHsl(hex, lighten)
    return "color: " + hex + " !important;" + "background-color:" + hsla + " !important;" + "border-color:" + hex + " !important;"
}
