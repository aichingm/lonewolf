<template>
    <n-space vertical>
        <InitialFocus />
        <n-space justify="space-between">
            <div>Dark Mode</div>
            <n-select
                v-model:value="darkMode"
                :options="options"
                :consistent-menu-width="false"
            />
        </n-space>
    </n-space>
</template>


<script setup lang="ts">
import { ref, watch } from "vue";

import InitialFocus from "@/components/InitialFocus.vue";

import { useAppSettings } from '@/components/appSettings/api'

import type Settings from "@/common/settings/AppSettings"

const $props = defineProps<{
    appSettings: Settings;
}>();


const options = [
    {
        label: "System",
        value: 'system',
    },
    {
        label: "Light",
        value: 'light',
    },
    {
        label: "Dark",
        value: 'dark',
    },
]

const upgradeDarkMode = (value: string | boolean) => (typeof value == "boolean" ? (value ? "dark" : "light"): value)
const fixDarkModeString = (value: string) : "system" | "light" | "dark" => {
    if(value == "dark"){
        return "dark"
    }
    if(value == "light"){
        return "light"
    }
    return "system"
}

const darkMode = ref(upgradeDarkMode($props.appSettings.darkMode))

const appSettings = useAppSettings()

watch(darkMode, ()=> appSettings.mutate((s: Settings)=>s.darkMode = fixDarkModeString(darkMode.value)))


</script>
<style scoped>
.setting-line {
    width:300px;
    margin-right:20px;
}

</style>
