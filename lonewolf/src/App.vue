<script setup lang="ts">
import { RouterView } from "vue-router";

const themeOverrides = {
    common: {
        fontWeightStrong: "500",
        fontWeight: "400",
        bodyColor: "#C8DCF9FF",
    },
};

const theme = null;
</script>

<template>
    <n-config-provider :theme="theme" :theme-overrides="themeOverrides" class="app-config-wrapper">
        <n-global-style />
        <router-view v-slot="{ Component }">
            <keep-alive>
                <component :is="Component" />
            </keep-alive>
        </router-view>
        <RouterView name="modal"/>
    </n-config-provider>
</template>

<style scoped>
.app-config-wrapper{
    height: 100%;
}
</style>
