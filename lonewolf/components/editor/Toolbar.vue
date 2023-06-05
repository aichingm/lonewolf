<template>
    <div class="toolbar">
        <div class="left">
            <n-button v-if="$props.toolbarConfig.showCreateBold" quaternary @click="bold" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-bold-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateItalic" quaternary @click="italic" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-italic-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateCode" quaternary @click="code" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:code-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <div class="new-section"></div>
            <n-button v-if="$props.toolbarConfig.showCreateLink" quaternary @click="link" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:link-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateImage" quaternary @click="image" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:image-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <div class="new-section"></div>
            <n-button v-if="$props.toolbarConfig.showCreateHeadline1" quaternary @click="headline" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-header-1-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateCodeFence" quaternary @click="codeFence" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:braces-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateBlockquote" quaternary @click="blockqoute" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-quote-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <div class="new-section"></div>
            <n-button v-if="$props.toolbarConfig.showCreateList" quaternary @click="list" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-bullet-list-ltr-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateOrderedList" quaternary @click="orderedList" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-number-list-ltr-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateTaskList" quaternary @click="taskList" >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:task-list-ltr-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.toolbarConfig.showCreateTable" quaternary @click="table" >
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
            <n-button v-if="$props.toolbarConfig.showAddFile" quaternary @click="addFile" >
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

import type { Store as AttachmentStore } from "@/common/attachments/Store";
import type CardAttachment from "@/common/data/CardAttachment";

import { supportsChooseFile } from "@/platform/Functions";
import { chooseFile } from "@platform/Files";




const $props = defineProps<{
    editorView: EditorView;
    toolbarConfig: ToolbarConfig;
    attachmentStore?: AttachmentStore
    attachments?: CardAttachment[]

}>()

const $emit = defineEmits(["previewToggleChanged", "save", "reset"]);

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
            onClick:(_e: Event)=>{insertAttachment(attachment, url); attachmentOptionsShow.value=false},
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


function insertText(text: string) {
    $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => (
        {
            changes: [{from: range.from, insert: text}],
            range: EditorSelection.range(range.from + text.length, range.from + text.length)
        }
    )))
}

function wrapKeepRange (range: SelectionRange, start: string, end: string) {
    const transaction = {
        changes: [{from: range.from, insert: start}, {from: range.to, insert: end}],
        range: EditorSelection.range(range.from+start.length, range.to+start.length)
    }
    return transaction;
}

function unwrapKeepRange (range: SelectionRange, start: string, end: string) {
    const transaction = {
        changes: [
            {from: range.from - start.length, to: range.from, insert: ""},
            {from: range.to, to: range.to + end.length, insert: ""}
        ],
        range: EditorSelection.range(range.from - start.length, range.to - start.length)
    }
    return transaction;
}

function toggleWrap (range: SelectionRange, start: string, end: string) {

    const doc = $props.editorView.state.doc
    const docLen = doc.length

    const startUnwrapPossible = (range.from - start.length) >= 0
    const endUnwrapPossible = (range.to + end.length) <= docLen

    if (startUnwrapPossible && endUnwrapPossible) {
        const unwrapableString = doc.sliceString(range.from - start.length, range.to + end.length)
        if (unwrapableString.startsWith(start) && unwrapableString.endsWith(end)) {
            return unwrapKeepRange(range, start, end)
        }
    }
    return wrapKeepRange(range, start, end)
}

function wrapColapse (range: SelectionRange, pos: number, start: string, end: string) {
    const transaction = {
        changes: [{from: range.from, insert: start}, {from: range.to, insert: end}],
        range: EditorSelection.range(pos, pos)
    }
    return transaction;
}

function forEachLine<RetType>(
    view: EditorView,
    range: SelectionRange,
    callback: (line: Line, number: number, iterationIndex: number) => RetType
): RetType[] {
    const firstLine = view.state.doc.lineAt(range.from)
    const lastLine = view.state.doc.lineAt(range.to)
    const accum = [];
    for(let i = firstLine.number; i <= lastLine.number; i++) {
        accum.push(callback(view.state.doc.line(i), i, i - firstLine.number));
    }
    return accum;
}

function calcShiftingForLineStartingBlocks(range: SelectionRange, startChar: string): number {
    return forEachLine($props.editorView, range, (line: Line, _number: number):number => {return line.text.startsWith(startChar)?1:2}).reduce((partialSum, a) => partialSum + a, 0)
}

function bold() {
    $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => toggleWrap(range, "**", "**")))
    $props.editorView.focus()
}

function italic() {
    $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => toggleWrap(range, "*", "*")))
    $props.editorView.focus()
}

function code() {
    $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => toggleWrap(range, "`", "`")))
    $props.editorView.focus()
}

function link() {
    $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => wrapColapse(range, range.to+3, "[", "]()")))
    $props.editorView.focus()
}

function image() {
    $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => wrapColapse(range, range.to+4, "![", "]()")))
    $props.editorView.focus()
}

function headline() {
    $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => (
        {
            changes: forEachLine($props.editorView, range, (line: Line, _number: number) => ({from: line.from, insert: line.text.startsWith("#") ? "#" : "# "})),
            range: EditorSelection.range(range.from + ($props.editorView.state.doc.lineAt(range.from).text.startsWith("#") ? 1 : 2), range.to + calcShiftingForLineStartingBlocks(range, "#"))
        }
    )))
    $props.editorView.focus()
}

function codeFence() {

    $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => {
        const fistLine = $props.editorView.state.doc.lineAt(range.from);
        const lastLine = $props.editorView.state.doc.lineAt(range.to);
        const beforeLine = $props.editorView.state.doc.line(Math.max(fistLine.number - 1, 1))
        const afterLine = $props.editorView.state.doc.line(Math.min(lastLine.number + 1, $props.editorView.state.doc.lines))

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
                    {from: beforeLine.from, to: beforeLine.to+1 , insert: ""},
                    {from: afterLine.from -1, to: afterLine.to, insert: ""},
                ],
                range: EditorSelection.range(range.from - beforeLine.text.length -1, range.to - beforeLine.text.length-1)
            }
        }

        return  {changes: [],range: range}
    }))
    $props.editorView.focus()
}

function blockqoute() {
    toggleLines(/^> /, (_lineIndex)=>"> ")
    $props.editorView.focus()
}

function list() {
    toggleLines(/^\* /, (_lineIndex)=>"* ")
    $props.editorView.focus()
}

function toggleLines(markerPattern: RegExp, insertMarker: (lineIndex: number)=>string) {

    $props.editorView.dispatch($props.editorView.state.changeByRange((range: SelectionRange) => {

        const doc = $props.editorView.state.doc
        const firstLine = doc.lineAt(range.from)
        const lastLine = doc.lineAt(range.to)

        const firstDynamicMarker = firstLine.text.match(markerPattern)
        const lastDynamicMarker = lastLine.text.match(markerPattern)

        const mode = firstDynamicMarker == null // true if marker should be added

        const changesAndShifts = forEachLine($props.editorView, range, (line, _lineNumber, lineIndex): [{from: number, to: number, insert: string}, number] => {
            const marker = insertMarker(lineIndex)
            const dynamicMarker = line.text.match(markerPattern);
            const hasMarker = dynamicMarker != null

            if (mode && !hasMarker) { // Add marker if mode is "add" and line does not start with marker
                return [
                    {
                        from: line.from,
                        to: line.from,
                        insert: marker
                    },
                    marker.length
                ]
            } else if (!mode && hasMarker) { // Remove marker if mode is "remove" and line does start with marker
                return [
                    {
                        from: line.from,
                        to: line.from + dynamicMarker[0].length,
                        insert: ""
                    },
                    -dynamicMarker[0].length
                ]
            } else {
                return [
                    { // mode is "add" and line starts with marker OR mode is "remove" and line does not start with marker
                        from: line.from,
                        to: line.from,
                        insert: ""
                    },
                    0
                ]
            }
        })

        const shift = changesAndShifts.map(x=>x[1]).reduce((v, a)=> v + a, 0)
        const changes = changesAndShifts.map(x=>x[0])

        return {
            changes: changes,
            range: EditorSelection.range(
                Math.max(range.from + (firstLine.from == range.from ? 0 : changesAndShifts[0][1]), 0),
                shift + (mode ? range.to : Math.max(range.to, lastLine.from + (lastDynamicMarker!=null?lastDynamicMarker[0].length : 0)))
            )
        };
    }))

}

function orderedList() {
    toggleLines(/^[0-9]+\. /, (lineIndex)=>(lineIndex + 1) + ". ")
    $props.editorView.focus()
}

function taskList() {
    toggleLines(/^\* \[[ x]\] /, (_lineIndex)=>"* [ ] ")
    $props.editorView.focus()
}

function table() {

    insertText("\n" +
        "|left | center | right|\n" +
        "|:----|:------:|-----:|\n" +
        "|1    |2       |3     |\n" +
        "|a    |b       |c     |\n\n"
    )

    $props.editorView.focus()
}

async function addFile() {
    if(supportsChooseFile()){
        const [name, mime, path] = await chooseFile()
        insertText((mime.startsWith("image/")?"!":"") + "[" + name + "](" + path + ")")
        $props.editorView.focus()
    }
}

function insertAttachment(attachment: CardAttachment, _url: string){
    insertText((attachment.mime.startsWith("image/")?"!":"") + "[" + attachment.name + "](" + attachment.location + ")")
    $props.editorView.focus()
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
