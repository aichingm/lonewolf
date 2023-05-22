<script setup lang="ts">
import AppView from "@/views/AppView.vue";

const themeOverrides = {
    common: {
        fontWeightStrong: "500",
        fontWeight: "400",
    },
};

const theme = null;
</script>

<template>
    <n-config-provider :theme="theme" :theme-overrides="themeOverrides" class="app-config-wrapper">
        <n-global-style />
        <n-dialog-provider>
            <AppView />
        </n-dialog-provider>
    </n-config-provider>
</template>

<style scoped>
.app-config-wrapper{
    height: 100%;
}
</style>
