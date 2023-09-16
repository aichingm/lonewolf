<template>
    <div ref="elem" :class="'content ' + ($props.darkMode?'markdown-body-dark':'') + ' markdown-body'" v-html="previewHtml" @click="interceptLinkAction"></div>
</template>
<script setup lang="ts">

import { computed, ref, onMounted } from 'vue'
import type { Ref } from 'vue'

import { marked } from 'marked';
import DOMPurify from 'dompurify';

const $props = defineProps<{
    darkMode: boolean;
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
    overflow-x: auto;
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

.markdown-body {
    color-scheme: light;
    --color-canvas-default: inherit;
}

.markdown-body-dark {
    color-scheme: dark;
    --color-prettylights-syntax-comment: #8b949e;
    --color-prettylights-syntax-constant: #79c0ff;
    --color-prettylights-syntax-entity: #d2a8ff;
    --color-prettylights-syntax-storage-modifier-import: #c9d1d9;
    --color-prettylights-syntax-entity-tag: #7ee787;
    --color-prettylights-syntax-keyword: #ff7b72;
    --color-prettylights-syntax-string: #a5d6ff;
    --color-prettylights-syntax-variable: #ffa657;
    --color-prettylights-syntax-brackethighlighter-unmatched: #f85149;
    --color-prettylights-syntax-invalid-illegal-text: #f0f6fc;
    --color-prettylights-syntax-invalid-illegal-bg: #8e1519;
    --color-prettylights-syntax-carriage-return-text: #f0f6fc;
    --color-prettylights-syntax-carriage-return-bg: #b62324;
    --color-prettylights-syntax-string-regexp: #7ee787;
    --color-prettylights-syntax-markup-list: #f2cc60;
    --color-prettylights-syntax-markup-heading: #1f6feb;
    --color-prettylights-syntax-markup-italic: #c9d1d9;
    --color-prettylights-syntax-markup-bold: #c9d1d9;
    --color-prettylights-syntax-markup-deleted-text: #ffdcd7;
    --color-prettylights-syntax-markup-deleted-bg: #67060c;
    --color-prettylights-syntax-markup-inserted-text: #aff5b4;
    --color-prettylights-syntax-markup-inserted-bg: #033a16;
    --color-prettylights-syntax-markup-changed-text: #ffdfb6;
    --color-prettylights-syntax-markup-changed-bg: #5a1e02;
    --color-prettylights-syntax-markup-ignored-text: #c9d1d9;
    --color-prettylights-syntax-markup-ignored-bg: #1158c7;
    --color-prettylights-syntax-meta-diff-range: #d2a8ff;
    --color-prettylights-syntax-brackethighlighter-angle: #8b949e;
    --color-prettylights-syntax-sublimelinter-gutter-mark: #484f58;
    --color-prettylights-syntax-constant-other-reference-link: #a5d6ff;
    --color-fg-default: #c9d1d9;
    --color-fg-muted: #8b949e;
    --color-fg-subtle: #6e7681;
    /*--color-canvas-default: #0d1117;*/
    --color-canvas-default: inherit;
    --color-canvas-subtle: #161b22;
    --color-border-default: #30363d;
    --color-border-muted: #21262d;
    --color-neutral-muted: rgba(110,118,129,0.4);
    --color-accent-fg: #58a6ff;
    --color-accent-emphasis: #1f6feb;
    --color-attention-subtle: rgba(187,128,9,0.15);
    --color-danger-fg: #f85149;
}
















</style>
