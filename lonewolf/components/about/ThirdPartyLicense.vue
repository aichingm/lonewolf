<template>
    <n-card class="author-card">
        <n-thing>
            <template #header>
                {{ $props.project.project }}
            </template>
            <template  #header-extra>
                <div class="link-sm">
                    <n-a :href="'https://spdx.org/licenses/' + $props.project.license + '.html'" target="_blank">{{ $props.project.license }}</n-a>
                    <n-icon :size="13"><icon icon="fluent:scales-20-filled"/></n-icon>
                </div>
            </template>
            <template  #description>
                <div class="link"><n-icon :size="20"><icon icon="fluent:link-20-filled"/></n-icon> <n-a :href="$props.project.url" target="_blank">Website</n-a></div>
                <div class="link"><n-icon :size="20"><icon icon="fluent:code-20-filled"/></n-icon> <n-a :href="$props.project.repository" target="_blank">Repository</n-a></div>
            </template>
        </n-thing>
    </n-card>
</template>

<script setup lang="ts">
import type {Project} from '@platform/content/third-party-licenses'
const $props = defineProps<{
    project: Project;
}>();

</script>
<style scoped>
.link {
    display:flex;
    gap: 10px;
    align-items: center;
}
.link-sm {
    display:flex;
    align-items: center;
    gap: 2px;
    font-size: 11px;
}
</style>
