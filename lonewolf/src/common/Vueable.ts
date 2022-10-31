import type { Ref } from "vue"

export default interface Vueable {
    vueTicker(): Ref<string>
}
