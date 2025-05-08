<script setup lang="ts">
import { ref } from 'vue'
import AppView from "@/views/AppView.vue";
import SettingsProvider from "@/components/appSettings/SettingsProvider.vue";

import { themeOverridesDark, themeOverridesLight } from './themes/theme'

import { darkTheme } from 'naive-ui'

const systemDarkMode = ref(window.matchMedia("(prefers-color-scheme: dark)").matches)

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    systemDarkMode.value = event.matches
})

</script>

<template>
    <SettingsProvider>
        <template #default="{appSettings}">
            <n-config-provider
                :theme="(appSettings.darkMode=='system'?systemDarkMode:appSettings.darkMode=='dark')?darkTheme:null"
                :theme-overrides="(appSettings.darkMode=='system'?systemDarkMode:appSettings.darkMode=='dark')?themeOverridesDark:themeOverridesLight"
                class="app-config-wrapper"
                :style="'background-color: ' + ((appSettings.darkMode=='system'?systemDarkMode:appSettings.darkMode=='dark')?'#000':'#fff')"
            >
                <n-global-style />
                <n-dialog-provider>
                    <AppView
                        :app-settings="appSettings"
                        :dark-mode="appSettings.darkMode=='system'?systemDarkMode:appSettings.darkMode=='dark'"
                    />
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
