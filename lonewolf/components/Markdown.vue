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
    imageInterceptor?: (value: HTMLImageElement)=>void;
    imageUpdater?: (value: HTMLImageElement)=>void;
    linkClickInterceptor?: (e: Event)=>boolean;
}>()


const previewHtml = computed(() => {
    DOMPurify.addHook(
        'afterSanitizeAttributes',
        function (currentNode, _hookEvent, _config) {
            if("tagName" in currentNode && currentNode.tagName == "IMG" && $props.imageInterceptor){
                $props.imageInterceptor(currentNode as HTMLImageElement)
            }
            return currentNode;
        });
    const clean = DOMPurify.sanitize(marked($props.value))
    DOMPurify.removeAllHooks();
    return clean
})

const elem = ref(null) as Ref<Element|null>;

if ($props.imageUpdater) {
    onMounted(()=>{
        if (elem.value != null && $props.imageUpdater != undefined) {
            elem.value.querySelectorAll("img").forEach(
                (value: HTMLImageElement, _key, _parent)=>$props.imageUpdater!=undefined?$props.imageUpdater(value):null
            )
        }
    })
}

const interceptLinkAction = $props.linkClickInterceptor != undefined ? (e: Event)=>{

    if (e.target != null && $props.linkClickInterceptor != undefined) { // WHY is '$props.linkClickInterceptor != undefined' needed here? is the TS compiler so stupid? (already checked two lines above...)
        // Because  the $props.linkClickInterceptor could be set to null before the function is called
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

.content {
  font-family: v-sans, v-mono, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

.markdown-body :deep(tt), .markdown-body :deep(code), .markdown-body :deep(samp) {
  font-family: v-mono, monospace !important;
}

.content > :first-child {
    margin-top: 0;
}

.content > :last-child {
    margin-bottom: 0;
}
</style>
