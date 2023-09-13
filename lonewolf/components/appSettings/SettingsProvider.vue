<template>
    <slot v-if="appSettings != null" v-bind="{appSettings: appSettings}"/>
</template>

<script setup lang="ts">

import { ref, reactive, toRaw } from 'vue'
import type { Ref } from 'vue'
import { applicationSettingsStorage } from "@/platform/Functions";
import type Settings from "@/common/settings/AppSettings"

const appSettings = ref(null) as Ref<Settings|null>
const storage = applicationSettingsStorage()
storage.load().then((s: Settings)=>{
    appSettings.value = reactive(s)
})

defineExpose({
    functions: {
        mutate: (mutator: (s: Settings)=>void) => {
            if(appSettings.value == null){
                throw new Error("SettingsProvider has not loaded any settigns, cant mutate")
            }
            mutator(appSettings.value)
            storage.save(toRaw(appSettings.value))
        },
    }
})

</script>
<style scoped>
</style>

