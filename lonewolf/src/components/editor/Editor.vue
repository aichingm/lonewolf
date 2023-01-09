<template>
    <n-config-provider :theme="null">
        <n-el tag="div" class="editor">
            <ToolbarVue v-if="viewReady && $props.showToolbar && editMode" :editor-view="view as EditorView" @previewToggleChanged="setEditMode"
                        showCreateBold
                        showCreateItalic
                        showCreateCode
                        showCreateLink
                        showCreateImage
                        showCreateHeadline1
                        showCreateHeadline2
                        showCreateList
                        showCreateOrderedList
                        showCreateTaskList
                        showDone

            />
            <Codemirror
                class="cm6"
                :style="{'background-color': 'var(--base-color)'}"
                placeholder="..."
                :autofocus="true"
                :indent-with-tab="true"
                :tab-size="2"
                :extensions="extensions"
                v-model="editorContent"
                @ready="handleReady"
                @change="log"
                @focus="log"
                @blur="setEditMode(false)"
                v-if="editMode"
            />
            <div class="preview" v-html="previewHtml" v-if="!editMode" @click="setEditMode(true)">
            </div>
            <div class="preview-empty" v-if="previewHtml=='' && !editMode" @click="setEditMode(true)"><n-text depth="3">Description...</n-text></div>
        </n-el>
    </n-config-provider>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watch } from 'vue'
import type { Ref } from 'vue'

import { minimalSetup, EditorView } from "codemirror"

import { dropCursor } from "@codemirror/view"

import type { EditorState } from '@codemirror/state'
import { markdown } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { autocompletion } from "@codemirror/autocomplete"

import { marked } from 'marked';
import DOMPurify from 'dompurify';

import ToolbarVue from "./Toolbar.vue"

const $props = withDefaults(defineProps<{
    content: string
    editMode: Ref<boolean>
    showToolbar?: boolean
}>(),{
    showToolbar: true
});

const $emit = defineEmits(["update:content", "update:editMode"]);

const editMode = ref($props.editMode)
const setEditMode = (value: boolean) => editMode.value = value

watch(editMode, ()=> {
    $emit("update:editMode", editMode)
    if (editorContent.value != originalEditorContent) {
        $emit("update:content", editorContent.value)
    }
})


const originalEditorContent = ref($props.content).value
const editorContent = ref($props.content)

//debug  helper
const log = ()=>false

// preview editor switching variable
//watch($props.editMode, ()=>editMode = ref($props.editMode))

// marked-preview rendering
const previewHtml = computed(() => {
    return DOMPurify.sanitize(marked(editorContent.value))
})

// setup codemirror

// Autocompeletion idea
//
//Our list of completions (can be static, since the editor
/// will do filtering based on context).
//
// const emoji = [
//   {label: "smile", type: "keyword", apply: "smile:"},
//   {label: "wink", type: "constant", apply: "wink:", info: "Wink"},
//   {label: "cash", type: "variable", apply: "cash:"},
// ]
//
// const people = [
//   {label: "mario", type: "keyword", },
//   {label: "bob", type: "constant", },
//   {label: "alice", type: "variable", },
// ]
//
// function myCompletions(context) {
//   let before = context.matchBefore(/[\:]\w*/)
//   if (!before) return null
//   return {
//     from: before ? before.from + 1 : context.pos,
//     options: emoji,
//     validFor: /^\w*$/,
//   }
// }
//
// function myCompletions1(context) {
//   let before = context.matchBefore(/[\@]\w*/)
//   if (!before) return null
//   return {
//     from: before ? before.from + 1 : context.pos,
//     options: people,
//     validFor: /^\w*$/,
//   }
// }


const extensions = [
    minimalSetup,
    markdown({codeLanguages: languages}),
    EditorView.contentAttributes.of({spellcheck: "true"}),
    dropCursor(),
    autocompletion(/*{override: [myCompletions, myCompletions1]}*/),
    EditorView.domEventHandlers({
        ondragover(event, _view) {
            event.preventDefault();
        },
        drop(event, view) {
            // how to disable the default action? https://github.com/codemirror/view/blob/1b7d7f1eb9bc809b717e21bee525d8c1393f33fa/src/input.ts#L105  call event.preventDefault(); or return true;

            if (!event.dataTransfer) return false
            if (view.state.readOnly) {
                event.preventDefault();
                return false
            }

            const files = event.dataTransfer.files
            if (files && files.length) {
                event.preventDefault()
                // dropping a file or files
                dropText(view, event, "![bla](kjbna97sdf89a7sbdf9a)", false)

            } else {
                // original operation is dropText(view, event, event.dataTransfer.getData("Text"), true)
                // https://github.com/codemirror/view/blob/1b7d7f1eb9bc809b717e21bee525d8c1393f33fa/src/input.ts#L578
                return false
            }
        }
    })
]

function dropText(view: EditorView, event: DragEvent, text: string, _direct: boolean) {
    // sight modification of https://github.com/codemirror/view/blob/1b7d7f1eb9bc809b717e21bee525d8c1393f33fa/src/input.ts#L537
    if (!text) return
    event.preventDefault()

    const dropPos = view.posAtCoords({x: event.clientX, y: event.clientY}, false)
    const changes = view.state.changes({from: dropPos, insert: text})

    view.dispatch({
        changes,
        selection: {anchor: changes.mapPos(dropPos, -1), head: changes.mapPos(dropPos, 1)},
        userEvent: "input.drop"
    })

    view.focus()
}

// Codemirror EditorView instance ref
const view = shallowRef<EditorView>()
const viewReady = ref(false)

const handleReady = (payload: { view: EditorView; state: EditorState; container: HTMLDivElement }) => {
    view.value = payload.view
    viewReady.value = true
}

</script>

<style scoped>
.cm6 {
    background-color: var(--base-color);
    display: block !important;
}

.preview {
    background-color: var(--base-color);
    display: block;
    --overflow: hidden; /* hide top and bottom margins from inner content*/
}

.preview > :first-child{
  margin-top: 0;
}
.preview > :last-child{
  margin-bottom: 0;
}

.preview-empty{

    color: #caffee;
}

.editor {
  display: block;
  /*border: 1px solid #c9c9c9;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;*/
}

.cm-wrapper {
    background-color: var(--base-color);
    display: block;
}

:deep() .cm-content, :deep() .cm-gutters {
  min-height: var(--minheight) !important;
}

:deep() .cm-editor.cm-focused {
  outline: 0;
}
</style>
