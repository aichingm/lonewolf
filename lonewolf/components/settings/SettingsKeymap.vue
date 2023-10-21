<template>
    <n-space vertical>
        <InitialFocus/>
        <n-input placeholder="Search" v-model:value="filter" clearable >
            <template #prefix>
                <n-icon>
                    <icon icon="fluent:search-20-regular" />
                </n-icon>
            </template>
        </n-input>
        <div v-for="entry in keymapEntries" :key="entry.name">
            <n-space justify="space-between">
                <div>{{entry.label}}</div>
                <n-tag v-if="entry.keys !=''" type="success" closable @close="()=>handleClose(entry.name)">{{ entry.keys }}</n-tag>
                <n-space v-else>
                    <n-button strong secondary @click="(e: Event)=>handleAssign(entry.name, e)">
                        Assign
                    </n-button>
                    <n-tooltip trigger="hover">
                        <template #trigger>
                            <n-button strong secondary @click="()=>handleRestore(entry.name)">
                                <n-icon><icon icon="fluent:arrow-undo-20-regular" /></n-icon>
                            </n-button>
                        </template>
                        Restore default key binding
                    </n-tooltip>
                </n-space>
            </n-space>
        </div>
    </n-space>
</template>


<script setup lang="ts">
import { ref, computed } from "vue";

import InitialFocus from "@/components/InitialFocus.vue";

import { useAppSettings } from '@/components/appSettings/api'

import type Settings from "@/common/settings/AppSettings"


import { defaultKeymap } from "@/platform/Functions"


import { record } from "@/lib/bindkey"
import type { Combination } from "@/lib/bindkey"


const $props = defineProps<{
    appSettings: Settings;
}>();

const appSettings = useAppSettings()

const filter = ref("")
const keymapEntries = computed(()=>Object.values($props.appSettings.keymap).filter(e=>e.label.toLowerCase().includes(filter.value)))


function handleClose(action: string){
    appSettings.mutate((s: Settings)=>{
        if(s.keymap[action]){
            s.keymap[action].keys = "" // ! since ts does not know that .has() has checked the existance already
        }
    })
}

function handleAssign(action: string, e: Event) {
    if (!e.target || !(e.target as Element).innerHTML) {
        throw new Error("Failed to set innerHTML of 'Assign' button")
    }
    const element = e.target as Element

    element.innerHTML = "Press key combination..."

    record(window, 2000).then((c: Combination)=>{
        appSettings.mutate((s: Settings)=>{
            if(s.keymap[action]) {
                s.keymap[action].keys = c.toDisplay()
            }
        })
    }).catch(()=>element.innerHTML = "Assign")
}

function handleRestore(action: string) {
    appSettings.mutate((s: Settings)=>{
        if(s.keymap[action] && defaultKeymap()[action]){
            s.keymap[action].keys = defaultKeymap()[action].keys
        } else {
            throw new Error(`Trying to restore unknown keyboard shortcut '${action}'`)
        }
    })
}


</script>
<style scoped>
.setting-line {
    width:300px;
    margin-right:20px;
}

</style>
