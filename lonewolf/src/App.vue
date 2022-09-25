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
    <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
        <n-global-style />
        <RouterView />
    </n-config-provider>
</template>

<style scoped></style>
