import type { Ref } from 'vue'
import { toRaw, isRef } from 'vue'

export class RefProtector<T>{

    private _ref: Ref<T>
    private _update?: (arg: T) => void

    constructor(ref: Ref<T>, func?: (arg: T) => void) {
        this._ref = ref
        this._update = func
    }

    public get ref(): Ref<T> {
        return this._ref
    }

    public set ref(ref: Ref<T>) {
        this._ref = ref
    }

    public get update(): ((arg: T) => void) {
        return this._update || ((_)=>{return})
    }

    public set update(func: (arg: T) => void) {
        this._update = func
    }

    public assign(t: T) {
        this.ref.value = t;
    }

}

export function assignArray<T>(target: Ref<T[]>, values: T[]) {
    if(toRaw(target.value)===values ||
        target.value===values
    ){
        console.error("You are tring to reassign the same object to a Ref, this will not mark the Ref as dirty!")
        target.value = values
        return;
    }
    target.value.splice(0, target.value.length)
    values.forEach(v => target.value.push(v))
}

export function typeName(o: unknown): string {
    if (isRef(o)) {
        return "Ref<" + (typeof o.value) + ">"
    }
    return typeof o
}
