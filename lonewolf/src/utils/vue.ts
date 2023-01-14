import type { Ref } from 'vue'

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

}

