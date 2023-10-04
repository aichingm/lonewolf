<template>
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20" v-html="content">
    </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import icons from '@/assets/icons'

const $props = withDefaults(defineProps<{
    icon?: string;
}>(),{
    icon: "fluent:text-font-info-20-filled",
});

const content = computed(()=>{return icons[$props.icon]})

if (content.value == undefined || content.value == null) {
    console.error("Failed to load icon: " + $props.icon)
}


</script>

<style scoped>
</style>

