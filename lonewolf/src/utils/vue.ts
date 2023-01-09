import type { Ref } from 'vue'

export class RefProtector<T>{

    private _ref: Ref<T>

    constructor(ref: Ref<T>) {
        this._ref = ref
    }

    public get ref(): Ref<T> {
        return this._ref
    }

    public set ref(ref: Ref<T>) {
        this._ref = ref
    }
}

