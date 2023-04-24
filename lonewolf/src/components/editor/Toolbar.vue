<template>
    <div class="toolbar">
        <div class="left">
            <n-button v-if="$props.toolbarConfig.showCreateBold" quaternary @click="editorInteractions.bold" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-bold-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateItalic" quaternary @click="editorInteractions.italic" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-italic-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateCode" quaternary @click="editorInteractions.code" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:code-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <div class="new-section"></div>
            <n-button v-if="$props.toolbarConfig.showCreateLink" quaternary @click="editorInteractions.link" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:link-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateImage" quaternary @click="editorInteractions.image" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:image-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <div class="new-section"></div>
            <n-button v-if="$props.toolbarConfig.showCreateHeadline1" quaternary @click="editorInteractions.headline" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-header-1-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateCodeFence" quaternary @click="editorInteractions.codeFence" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:braces-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateBlockquote" quaternary @click="editorInteractions.blockqoute" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-quote-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <div class="new-section"></div>
            <n-button v-if="$props.toolbarConfig.showCreateList" quaternary @click="editorInteractions.list" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-bullet-list-ltr-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateOrderedList" quaternary @click="editorInteractions.orderedList" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-number-list-ltr-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateTaskList" quaternary @click="editorInteractions.taskList" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:task-list-ltr-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateTable" quaternary @click="editorInteractions.table" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:table-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-dropdown v-if="attachmentOptions.length > 0" trigger="click" @clickoutside="attachmentOptionsShow=false" :options="attachmentOptions" :show="attachmentOptionsShow" :show-arrow="true">
                <n-button v-if="$props.attachments != undefined" quaternary @click="attachmentOptionsShow=!attachmentOptionsShow">
                    <template #icon>
                        <n-icon size="20" color="gray">
                            <icon icon="fluent:attach-20-filled" />
                        </n-icon>
                    </template>
                </n-button>
            </n-dropdown>
            <n-button v-if="$props.attachmentStore != undefined" quaternary @click="editorInteractions.attachment" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:document-add-20-regular" />
                    </n-icon>
                </template>
            </n-button>

        </div>
        <div class="right">
            <n-switch v-if="$props.toolbarConfig.showPreviewToggle" class="preview-toggle" size="small" @update:value="(value: boolean) => $emit('previewToggleChanged', value)" :rail-style="previewRailStyle" >
                <template #checked>
                    Preview
                </template>
                <template #unchecked>
                    Editing
                </template>
            </n-switch>
            <n-button v-if="$props.toolbarConfig.showMarkdownReference" quaternary tag="a" href="https://www.markdownguide.org/basic-syntax/" target="_blank" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:calendar-info-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.resetable" quaternary @click="$emit('reset')">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:arrow-reset-20-filled" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.saveable" quaternary @click="$emit('save')" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon :icon="$props.toolbarConfig.saveIcon" />
                    </n-icon>
                </template>
            </n-button>
        </div>
    </div>
</template>

<script setup lang="ts">

import { h, ref, watch } from 'vue'
import type { CSSProperties, Ref} from 'vue'
import { NAvatar, NText, NIcon, useThemeVars } from 'naive-ui'
import type { DropdownRenderOption } from 'naive-ui'
import { Icon } from "@iconify/vue";

import type { EditorView } from "codemirror"
import { EditorSelection } from '@codemirror/state'
import type { SelectionRange, Line } from '@codemirror/state'

import type ToolbarConfig from './ToolbarConfig'

import { AttachmentMeta } from "@/common/attachments/Store";
import type { Store as AttachmentStore, Location } from "@/common/attachments/Store";
import type CardAttachment from "@/common/data/CardAttachment";




const $props = defineProps<{
    editorView: EditorView;
    toolbarConfig: ToolbarConfig;
    attachmentStore?: AttachmentStore
    attachments?: CardAttachment[]

}>()

const $emit = defineEmits(["previewToggleChanged", "save", "reset", "add-attachment"]);

const attachmentOptions = ref([]) as Ref<DropdownRenderOption[]>
const attachmentOptionsShow = ref(false)

watch($props, ()=>{
    attachmentOptions.value.splice(0, attachmentOptions.value.length)
    loadUrls()
})

async function loadUrls() {
    if($props.attachments != undefined && $props.attachments.length > 0 && $props.attachmentStore != undefined){
        for (const attachment of $props.attachments) {
            attachmentOptions.value = [...attachmentOptions.value, {
                key: 'header',
                type: 'render',
                render: renderAttachmentOption(attachment, await $props.attachmentStore.url(attachment.location))
            }]
        }
    }
}
loadUrls()

function renderAttachmentOption(attachment: CardAttachment, url: string){
    return ()=>h(
        'div',
        {
            style: 'display: flex; align-items: center; padding: 8px 12px;',
            class:'dropdown-button-0',
            onClick:(_e: Event)=>{editorInteractions.insertAttachment(attachment, url); attachmentOptionsShow.value=false},
        },
        [
            attachmentAvatar(attachment, url),
            h('div', null, [
                h('div', null, [
                    h(NText, { depth: 2 }, { default: () => attachment.name })
                ]),
                h('div', { style: 'font-size: 12px;' }, [
                    h(NText, { depth: 3 }, { default: () => attachment.mime })
                ])
            ])
        ]
    )
}

function attachmentAvatar(attachment: CardAttachment, url: string) {
    if(attachment.mime.startsWith("image/")){
        return h(NAvatar, {style: 'margin-right: 12px;',src: url})
    }
    return h(NIcon, {color:'gray', size:'36', style:''},  {default:()=>h(Icon, {icon:'fluent:document-20-filled'})})
}


// preview switcher theme
const theme  = useThemeVars();
const previewRailStyle = ({focused, checked}: {focused: boolean, checked: boolean}): CSSProperties => {
    const style: CSSProperties = {}
    style.background = checked ? theme.value.primaryColor : theme.value.infoColor;
    if (focused) {
        style.boxShadow = '0 0 0 2px '+style.background+'40'
    }
    return style
}

const editorInteractions = {

    insertText(text: string) {
        $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => (
            {
                changes: [{from: range.from, insert: text}],
                range: EditorSelection.range(range.from + text.length, range.from + text.length)
            }
        )))
    },
    wrap (range: SelectionRange, start: string, end: string) {
        const transaction = {
            changes: [{from: range.from, insert: start}, {from: range.to, insert: end}],
            range: EditorSelection.range(range.from == range.to?range.from+start.length:range.from, range.from == range.to?range.from+start.length:range.to+start.length+end.length)
        }
        return transaction;
    },
    wrapColapse (range: SelectionRange, pos: number, start: string, end: string) {
        const transaction = {
            changes: [{from: range.from, insert: start}, {from: range.to, insert: end}],
            range: EditorSelection.range(pos, pos)
        }
        return transaction;
    },
    forEachLine<RetType>(
        view: EditorView,
        range: SelectionRange,
        //callback: (line: Line, number: number) => {range: SelectionRange; changes: ChangeSpec}
        callback: (line: Line, number: number) => RetType
    ): RetType[] {
        const firstLine = view.state.doc.lineAt(range.from)
        const lastLine = view.state.doc.lineAt(range.to)
        const accum = [];
        for(let i = firstLine.number; i <= lastLine.number; i++) {
            accum.push(callback(view.state.doc.line(i), i - firstLine.number));
        }
        return accum;
    },
    calcShiftingForLineStartingBlocks(range: SelectionRange, startChar: string): number {
        return editorInteractions.forEachLine($props.editorView, range, (line: Line, _number: number):number => {return line.text.startsWith(startChar)?1:2}).reduce((partialSum, a) => partialSum + a, 0)
    },
    bold() {
        $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => editorInteractions.wrap(range, "**", "**")))
        $props.editorView.focus()
    },
    italic() {
        $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => editorInteractions.wrap(range, "*", "*")))
        $props.editorView.focus()
    },
    code() {
        $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => editorInteractions.wrap(range, "`", "`")))
        $props.editorView.focus()
    },
    link() {
        $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => editorInteractions.wrapColapse(range, range.to+3, "[", "]()")))
        $props.editorView.focus()
    },
    image() {
        $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => editorInteractions.wrapColapse(range, range.to+4, "![", "]()")))
        $props.editorView.focus()
    },
    headline() {
        $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => (
            {
                changes: editorInteractions.forEachLine($props.editorView, range, (line: Line, _number: number) => ({from: line.from, insert: line.text.startsWith("#") ? "#" : "# "})),
                range: EditorSelection.range(range.from + ($props.editorView.state.doc.lineAt(range.from).text.startsWith("#") ? 1 : 2), range.to + editorInteractions.calcShiftingForLineStartingBlocks(range, "#"))
            }
        )))
        $props.editorView.focus()
    },
    codeFence() {
        $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => {
            const fistLine = $props.editorView.state.doc.lineAt(range.from);
            const lastLine = $props.editorView.state.doc.lineAt(range.to);
            const beforeLine = $props.editorView.state.doc.line(fistLine.number - 1)
            const afterLine = $props.editorView.state.doc.line(lastLine.number + 1)

            if (!beforeLine.text.startsWith("```") || afterLine.text != "```") {
                return {
                    changes: [
                        {from: fistLine.from, insert: "```\n"},
                        {from: lastLine.to, insert: "\n```"}
                    ],
                    range: EditorSelection.range(range.from + 4, range.to + 4)
                }
            }

            if (beforeLine.text.startsWith("```") && afterLine.text == "```") {
                return {
                    changes: [
                        {from: beforeLine.from, to: beforeLine.to + 1 , insert: ""},
                        {from: afterLine.from, to: afterLine.to + 1 , insert: ""},
                    ],
                    range: EditorSelection.range(range.from - beforeLine.text.length - 1, range.to - beforeLine.text.length - 1)
                }
            }

            return  {changes: [],range: range}
        }))
        $props.editorView.focus()
    },
    blockqoute() {

        $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => (
            {
                changes: editorInteractions.forEachLine($props.editorView, range, (line) => ({from: line.from, insert: line.text.startsWith(">") ? ">" : "> "})),
                range: EditorSelection.range(range.from + ($props.editorView.state.doc.lineAt(range.from).text.startsWith(">") ? 1 : 2), range.to + editorInteractions.calcShiftingForLineStartingBlocks(range, ">"))
            }
        )))

        $props.editorView.focus()
    },
    list() {

        $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => (
            {
                changes: editorInteractions.forEachLine($props.editorView, range, (line) => (
                    {from: line.from, to: line.from + (line.text.startsWith("*") ? 2 : 0), insert: line.text.startsWith("*") ? "" : "* "}
                )
                ),
                range: EditorSelection.range(range.from + ($props.editorView.state.doc.lineAt(range.from).text.startsWith("*") ? -2 : 2), range.to + ($props.editorView.state.doc.lineAt(range.from).text.startsWith("*") ? -2 : 2))
            }

            // TODO if starts with "* " remove and reset cusor (special case if curstor < 2) else add "* " and shift cursor 2 to the right

        )))

        $props.editorView.focus()
    },
    orderedList() {

        $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => (
            {
                changes: editorInteractions.forEachLine($props.editorView, range, (line) => ({from: line.from, insert: line.text.startsWith(">") ? ">" : "> "})),
                range: EditorSelection.range(range.from + ($props.editorView.state.doc.lineAt(range.from).text.startsWith(">") ? 1 : 2), range.to + editorInteractions.calcShiftingForLineStartingBlocks(range, ">"))
            }
        )))

        $props.editorView.focus()
    },
    taskList() {
        $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => (
            {
                changes: editorInteractions.forEachLine($props.editorView, range, (line) => ({from: line.from, insert: line.text.startsWith(">") ? ">" : "> "})),
                range: EditorSelection.range(range.from + ($props.editorView.state.doc.lineAt(range.from).text.startsWith(">") ? 1 : 2), range.to + editorInteractions.calcShiftingForLineStartingBlocks(range, ">"))
            }
        )))

        $props.editorView.focus()
    },
    table() {
        $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => (
            {
                changes: editorInteractions.forEachLine($props.editorView, range, (line) => ({from: line.from, insert: line.text.startsWith(">") ? ">" : "> "})),
                range: EditorSelection.range(range.from + ($props.editorView.state.doc.lineAt(range.from).text.startsWith(">") ? 1 : 2), range.to + editorInteractions.calcShiftingForLineStartingBlocks(range, ">"))
            }
        )))

        $props.editorView.focus()
    },
    attachment(){

        const input = document.createElement('input');
        input.type = "file"
        input.click();

        input.addEventListener('change', (e)=>{
            const target = e.target as HTMLInputElement
            if (target == null || target.files == null) {
                return;
            }
            const file = target.files[0]

            const reader = new FileReader();
            reader.onload = function(e) {
                const target = e.target
                if(target != null && target.result != null && $props.attachmentStore){
                    const store = $props.attachmentStore
                    const meta = new AttachmentMeta()
                    meta.name = file.name
                    meta.mime = file.type
                    store.createLocation(meta).then((location: Location)=>{
                        editorInteractions.insertText((file.type.startsWith("image/")?"!":"") + "[" + file.name + "](" + location + ")")
                        store.pushData(location, target.result as ArrayBuffer) // this can be said because we use readAsArrayBuffer
                        $emit("add-attachment", location, file.name, file.type)
                    })
                }
            };
            reader.readAsArrayBuffer(file);// NOTICE if this is changed the type anontation has to change too!!
        }, false);

    },
    insertAttachment(attachment: CardAttachment, _url: string){
        editorInteractions.insertText((attachment.mime.startsWith("image/")?"!":"") + "[" + attachment.name + "](" + attachment.location + ")")
        $props.editorView.focus()
    }


}
</script>
<style>

.toolbar {
  min-height: 24px;
  background-color: var(--base-color);
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  display: flex;
  justify-content: space-between;
}

.toolbar div.left, .toolbar div.right{
  display: inline-block;
}

.toolbar .preview-toggle {
  display: inline-block;
  vertical-align: baseline;
  margin-right: 14px;

}

.new-section {
  display: inline-block;
  border-right: 1px solid black;
  height: 20px;
}


.dropdown-button-0 { /* this needs to be global since the actual menu is transportet into an emelemt somewhere in the parrants-cain of the dom */
margin: 4px;
cursor:pointer;
transition: background-color .3s var(--n-bezier);
}
.dropdown-button-0:hover {/* this needs to be global since the actual menu is transportet into an emelemt somewhere in the parrants-cain of the dom */
  background-color: var(--n-option-color-hover) !important;
}
:global(.dropdown-button-04aec8f5-4fd4-42e2-a43d-9ab34aea0a861 > .n-button__content) {/* this needs to be global since the actual menu is transportet into an emelemt somewhere in the parrants-cain of the dom */
  justify-content: space-between;
  display: inline-flex;
  flex-grow: 1;
}
</style>
