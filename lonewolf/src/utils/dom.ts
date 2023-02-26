


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
