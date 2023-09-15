
export function isChildOfId(id: string, e: Element): boolean {

    if(e.parentElement != null){
        if(e.parentElement.id == id){
            return true
        } else {
            return isChildOfId(id, e.parentElement)
        }
    }
    return false
}


export function findNextTabable(e: Element): HTMLElement|null {

    if(e.parentElement == null) {
        return null
    }
    
    const currentIndex = Array.from(e.parentElement.children).indexOf(e)

    for (let i = currentIndex + 1; i < e.parentElement.children.length; i++) {
        const child = e.parentElement.children.item(i)
        if (child == null) {
            break
        }

        const hit = findTabable(child)

        if(hit != null){
            return hit
        }
    }

    return findNextTabable(e.parentElement)

}

export function findTabable(element: Element): HTMLElement|null{
    if ((element as HTMLElement).style != undefined) {
        return null
    }

    const e = element as HTMLElement
    
    if (e.style != undefined && e.style.display != undefined &&e.style.display == "none") {
        return null
    }

    if (e.tabIndex != undefined && e.tabIndex >= 0){
        return e
    }

    for (const child of e.children) {
        const hit = findTabable(child)
        if (hit != null) {
            return hit
        }
    }

    return null
}

