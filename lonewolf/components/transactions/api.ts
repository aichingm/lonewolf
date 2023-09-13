import { getCurrentInstance } from "vue";
import type { ComponentInternalInstance } from "vue";

import type { Transaction } from "@/common/transactions/Transaction";

interface Emitter<T extends Transaction>{
    commit(t:T):void 
}

class Functions<T extends Transaction> implements Emitter<T>{

    private instance: ComponentInternalInstance

    constructor(instance: ComponentInternalInstance){
        this.instance = instance
    }

    public commit(t: T):void {

        const component = findEmitterFrom(this.instance, t)
        
        if ( component.exposed == null || component.exposed.emitterFunctions == null) {
            throw new Error("Emitter does not expose correct interface!")
        }

        return component.exposed.emitterFunctions.commit(t)
    }

}

export function useTransactions<T extends Transaction>(): Emitter<T> {
    const instance = getCurrentInstance()

    if(instance == null) {
        throw new Error("Failed to retrieve current instance")
    }

    return new Functions(instance)
}

export function findEmitterFrom(component: ComponentInternalInstance, t: Transaction) : ComponentInternalInstance{
    if (
        component.exposed != null && component.exposed.emitterFunctions != undefined &&
            component.exposed.emitterFunctions.filters != null && component.exposed.emitterFunctions.filters(t)
    ) {
        return component
    }
    if (component.parent != null) {
        return findEmitterFrom(component.parent, t)
    } else {
        throw new Error("No TransactionEmitter available!")
    }
} 
