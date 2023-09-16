<script setup lang="ts">
import AppView from "@/views/AppView.vue";
import SettingsProvider from "@/components/appSettings/SettingsProvider.vue";

import { themeOverridesDark, themeOverridesLight } from './themes/theme'

import { darkTheme } from 'naive-ui'

</script>

<template>
    <SettingsProvider>
        <template #default="{appSettings}">
            <n-config-provider 
                :theme="appSettings.darkMode?darkTheme:null" 
                :theme-overrides="appSettings.darkMode?themeOverridesDark:themeOverridesLight" 
                class="app-config-wrapper"
                :style="'background-color: ' + (appSettings.darkMode?'#000':'#fff')"
            >
                <n-global-style />
                <n-dialog-provider>
                    <AppView :appSettings="appSettings"/>
                </n-dialog-provider>
            </n-config-provider>
        </template>
    </SettingsProvider>
</template>

<style scoped>

.app-config-wrapper {
    height: 100%;
}

</style>
