import { getCurrentInstance } from "vue";
import type { ComponentInternalInstance } from "vue";
import type Settings from "@/common/settings/AppSettings"

class Functions{

    private instance: ComponentInternalInstance

    constructor(instance: ComponentInternalInstance){
        this.instance = instance
    }

    public mutate(mutator: (s: Settings)=>void):void {

        const component = findHandlerFrom(this.instance)
        
        if ( component.exposed == null || component.exposed.functions == null) {
            throw new Error("SettingsProvider does not expose correct interface!")
        }

        return component.exposed.functions.mutate(mutator)
    }

}

export function useAppSettings() {
    const instance = getCurrentInstance()

    if(instance == null) {
        throw new Error("Failed to retrieve current instance")
    }

    return new Functions(instance)
}

export function findHandlerFrom(component: ComponentInternalInstance) : ComponentInternalInstance{
    if (
        component.exposed != null && component.exposed.functions != undefined
    ) {
        return component
    }
    if (component.parent != null) {
        return findHandlerFrom(component.parent)
    } else {
        throw new Error("No SettingsProvider available!")
    }
} 
