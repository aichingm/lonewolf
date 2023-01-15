<template>
    <div class="toolbar">
        <div class="left">
            <n-button v-if="$props.showCreateBold" quaternary @click="editorInteractions.bold" :focusable="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-bold-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.showCreateItalic" quaternary @click="editorInteractions.italic" :focusable="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-italic-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.showCreateCode" quaternary @click="editorInteractions.code" :focusable="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:code-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <div class="new-section"></div>
            <n-button v-if="$props.showCreateLink" quaternary @click="editorInteractions.link" :focusable="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:link-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.showCreateImage" quaternary @click="editorInteractions.image" :focusable="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:image-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <div class="new-section"></div>
            <n-button v-if="$props.showCreateHeadline1" quaternary @click="editorInteractions.headline" :focusable="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-header-1-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.showCreateCodeFence" quaternary @click="editorInteractions.codeFence" :focusable="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:braces-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.showCreateBlockquote" quaternary @click="editorInteractions.blockqoute" :focusable="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-quote-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <div class="new-section"></div>
            <n-button v-if="$props.showCreateList" quaternary @click="editorInteractions.list" :focusable="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-bullet-list-ltr-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.showCreateOrderedList" quaternary @click="editorInteractions.orderedList" :focusable="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:text-number-list-ltr-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.showCreateTaskList" quaternary @click="editorInteractions.taskList" :focusable="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:task-list-ltr-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.showCreateTable" quaternary @click="editorInteractions.table" :focusable="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:table-20-regular" />
                    </n-icon>
                </template>
            </n-button>
        </div>
        <div class="right">
            <n-switch v-if="$props.showPreviewToggle" class="preview-toggle" size="small" @update:value="(value: boolean) => $emit('previewToggleChanged', value)" :rail-style="previewRailStyle" :focusable="false">
                <template #checked>
                    Preview
                </template>
                <template #unchecked>
                    Editing
                </template>
            </n-switch>
            <n-button v-if="$props.showMarkdownReference" quaternary tag="a" href="https://www.markdownguide.org/basic-syntax/" target="_blank" :focusable="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:calendar-info-20-regular" />
                    </n-icon>
                </template>
            </n-button>
            <n-button v-if="$props.showDone" quaternary >
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:save-20-regular" />
                    </n-icon>
                </template>
            </n-button>
        </div>
    </div>
</template>

<script setup lang="ts">

import type { CSSProperties} from 'vue'
import { useThemeVars } from 'naive-ui'
import type { EditorView } from "codemirror"
import { EditorSelection } from '@codemirror/state'
import type { SelectionRange, Line } from '@codemirror/state'

const $props = defineProps<{
    editorView: EditorView;
    showCreateBold?: boolean;
    showCreateItalic?: boolean;
    showCreateCode?: boolean;
    showCreateLink?: boolean;
    showCreateImage?: boolean;
    showCreateHeadline1?: boolean;
    showCreateCodeFence?: boolean;
    showCreateList?: boolean;
    showCreateOrderedList?: boolean;
    showCreateTaskList?: boolean;
    showCreateBlockquote?: boolean;
    showCreateTable?: boolean;
    showMarkdownReference?: boolean
    showPreviewToggle?: boolean;
    showDone?: boolean;
}>();

const $emit = defineEmits(["previewToggleChanged"]);

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
</style>
