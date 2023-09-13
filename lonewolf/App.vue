<script setup lang="ts">
import AppView from "@/views/AppView.vue";
import SettingsProvider from "@/components/appSettings/SettingsProvider.vue";

import { darkTheme } from 'naive-ui'

const themeOverrides = {
    common: {
        fontWeightStrong: "500",
        fontWeight: "400",
    },
};

</script>

<template>
    <SettingsProvider>
        <template #default="{appSettings}">
            <n-config-provider 
                :theme="appSettings.darkMode?darkTheme:null" 
                :theme-overrides="themeOverrides" 
                class="app-config-wrapper"
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
