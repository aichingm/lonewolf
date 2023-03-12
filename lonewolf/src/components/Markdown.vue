<template>
    <div ref="elem" class="content markdown-body" v-html="previewHtml" @click="interceptLinkAction"></div>
</template>
<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import type { Ref } from 'vue'

import { marked } from 'marked';
import DOMPurify from 'dompurify';

const $props = defineProps<{
    value: string
    imageInterceptor?: (value: HTMLImageElement, key: number, parent: unknown)=>void;
    linkClickInterceptor?: (e: Event)=>boolean;
}>()

const previewHtml = computed(() => {
    return DOMPurify.sanitize(marked($props.value))
})

const elem = ref(null) as Ref<Element|null>;

if ($props.imageInterceptor) {
    onMounted(()=>{
        if (elem.value != null && $props.imageInterceptor != undefined) {
            elem.value.querySelectorAll("img").forEach($props.imageInterceptor)
        }
    })
}

const interceptLinkAction = $props.linkClickInterceptor!= undefined ? (e: Event)=>{

    if (e.target != null && $props.linkClickInterceptor!= undefined) { // WHY is '$props.linkClickInterceptor!= undefined' needed here? is the TS compiler so stupid? (already checked two lines above...)
        const target = e.target as EventTarget
        if ("tagName" in target) {
            const element = target as Element
            if (element.tagName == "A") {
                return $props.linkClickInterceptor(e)
            }
        }
    }
    return true
}:(_: Event)=>true

defineExpose({ elem })

</script>
<style scoped>
.content > :first-child {
    margin-top: 0;
}

.content > :last-child {
    margin-bottom: 0;
}
</style>
