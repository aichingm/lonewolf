<template>
    <div></div>
</template>
<script setup lang="ts">
import { watch } from "vue"
import { Bindkey } from "@/lib/bindkey"
import type Settings from "@/common/settings/AppSettings"

const $props = defineProps<{
    appSettings: Settings
    actions: string[]
    target: EventTarget
}>()

const $emit = defineEmits(["action"]);

const bindkey = new Bindkey()

bindkey.attach($props.target)

const setup = ()=> {
    for(const a of $props.actions) {
        const entry = $props.appSettings.keymap[a]
        if(entry){
            bindkey.bind(entry.keys, ()=>$emit("action", a))
        }
    }
}
setup()

watch($props.appSettings, ()=>{bindkey.unbindAll(); setup()})

</script>
<style scoped>
</style>
