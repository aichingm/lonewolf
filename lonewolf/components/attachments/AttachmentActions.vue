<template>
    <n-dropdown
        :options="options"
        trigger="hover"
        placement="bottom-start"
        @select="handleSelect"
    >
        <!-- NOTICE this is set to bottom-start because buttom is blury on linux-tauri https://stackoverflow.com/questions/42669491/css-translate-with-percentage-causes-blurred-image -->
        <n-button
            text
            tag="a"
            :href="url"
            target="_blank"
            type="primary"
            class="dropdown-trigger"
        >
            {{ $props.attachment.name }}
        </n-button>
    </n-dropdown>
</template>

<script setup lang="ts">
import ConfirmButton from "@/components/buttons/ConfirmButton.vue";
import type CardAttachment from "@/common/data/CardAttachment";
import type { Attachment } from "@/common/attachments/Store";
import type Project from "@/common/Project";

import { h, ref, computed } from 'vue'
import { NAvatar, NText, NIcon } from 'naive-ui'
import Icon from "@/components/icons/Icon.vue";

import {presentAttachmentActionName, presentAttachment} from '@/platform/Functions'

const $props = defineProps<{
    project: Project;
    attachment: CardAttachment
    url: string
}>()

const $emit = defineEmits(["delete", "edit"]);

const url = ref($props.url)

// NOTICE computed is not a function but a macro, we need to tell the macro that it should depend on a Proxy changing thats why we have unused expressions in computed macros
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
const options = computed(()=>{url.value; return [
    {
        key: 'header',
        type: 'render',
        render: renderCustomHeader
    },
    {
        key: 'first-devider',
        type: 'divider'
    },
    {
        label: 'Copy Markdown',
        key: 'copy-markdown'
    },
    {
        label: presentAttachmentActionName(),
        key: 'download'
    },
    {
        label: "Edit",
        key: 'edit',
    },
    {
        key: 'delete',
        type: 'render',
        render: renderCustomDelete
    },
]})

function renderCustomHeader () {
    return h(
        'div',
        {
            style: 'display: flex; align-items: center; padding: 8px 12px;'
        },
        [
            attachmentAvatar($props.attachment.mime),
            h('div', null, [
                h('div', null, [
                    h(NText, { depth: 2 }, { default: () => $props.attachment.name })
                ]),
                h('div', { style: 'font-size: 12px;' }, [
                    h(NText, { depth: 3 }, { default: () => $props.attachment.mime  })
                ])
            ])
        ]
    )
}

function attachmentAvatar(mime: string) {
    if(mime.startsWith("image/")){
        return h(NAvatar, {style: 'margin-right: 12px;',src: url.value})
    }
    return h(NIcon, {color:'gray', size:'36', style:''},  {default:()=>h(Icon, {icon:'fluent:document-20-filled'})})
}

function attachmentToMarkdown() {
    if($props.attachment.mime.startsWith("image/")){
        return `![${$props.attachment.name}](${$props.attachment.location})`
    }
    return `[${$props.attachment.name}](${$props.attachment.location})`
}

function renderCustomDelete() {
    return h(
        ConfirmButton,
        {
            buttonProps: {type:"default", quaternary:true},
            buttonClass: "dropdown-button-04aec8f5-4fd4-42e2-a43d-9ab34aea0a86",
            confirmProps: {type:"error", quaternary:true},
            confirmClass: "dropdown-button-04aec8f5-4fd4-42e2-a43d-9ab34aea0a86",
            'onConfirm': ()=> $emit("delete", $props.attachment.id),
        },
        {
            button: ()=>false,
            confirm: ()=>"R U sure?",
            confirmTooltip: ()=>false,
        }
    )
}

function handleSelect (key: string | number) {
    switch(key){
    case "download":
        presentAttachment($props.attachment.name, url.value)
        break;
    case "copy-markdown":
        navigator.clipboard.writeText(attachmentToMarkdown());
        break;
    case "edit":
        $props.project.board.attachmentStore().updateAttachment($props.attachment.location).then((attachment: Attachment)=> {
            $emit("edit", $props.attachment.id, $props.attachment.location, attachment.name, attachment.mime);
            $props.project.board.attachmentStore().url($props.attachment.location).then((newUrl)=>url.value = newUrl)
        })
        break;
    }

}
</script>
<style scoped>
:global(.dropdown-button-04aec8f5-4fd4-42e2-a43d-9ab34aea0a86) { /* this needs to be global since the actual menu is transportet into an emelemt somewhere in the parents-chain of the dom */
  width: calc(100% - 8px);
  margin: 4px;
  justify-content: start;
  padding-left: 10px;
  padding-right: 10px;
}

:global(.dropdown-button-04aec8f5-4fd4-42e2-a43d-9ab34aea0a86:hover) {/* this needs to be global since the actual menu is transportet into an emelemt somewhere in the parents-chain of the dom */
  background-color: var(--n-option-color-hover) !important;
}

:global(.dropdown-button-04aec8f5-4fd4-42e2-a43d-9ab34aea0a86 > .n-button__content) {/* this needs to be global since the actual menu is transportet into an emelemt somewhere in the parents-chain of the dom */
  justify-content: space-between;
  display: inline-flex;
  flex-grow: 1;
}

.dropdown-trigger {
    height: 28px;
}
</style>
