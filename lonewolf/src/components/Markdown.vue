<template>
    <div class="content" v-html="previewHtml"></div>
</template>
<script setup lang="ts">

import { computed } from 'vue'

import { marked } from 'marked';
import DOMPurify from 'dompurify';

const $props = defineProps<{
    value: string
}>()

const previewHtml = computed(() => {
    return DOMPurify.sanitize(marked($props.value))
})

</script>
<style scoped>
.content > :first-child {
    margin-top: 0;
}

.content > :last-child {
    margin-bottom: 0;
}
</style>
