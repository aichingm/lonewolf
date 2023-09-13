<template>
    <n-space vertical>
        <InitialFocus/>
        <n-space justify="space-between">
            <div>Dark Mode</div>
            <n-switch class="settings-line" v-model:value="darkMode" />
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

const darkMode = ref($props.appSettings.darkMode)

const appSettings = useAppSettings()

watch(darkMode, ()=> appSettings.mutate((s: Settings)=>s.darkMode = darkMode.value))


</script>
<style scoped>
.setting-line {
    width:300px;
    margin-right:20px;
}

</style>
