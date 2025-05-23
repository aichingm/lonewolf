<template>
    <n-el
        :id="domId"
        tag="div"
        class="editor-root"
        tabindex="0"
        @focus="acceptFocus"
    >
        <transition
            name="editor"
            :duration=".3"
        >
            <n-el
                v-if="editMode"
                tag="div"
                class="editor"
            >
                <ToolbarVue
                    v-if="viewReady && $props.showToolbar && editMode"
                    :id="toolbarId"
                    :editor-view="view as EditorView"
                    :toolbar-config="$props.toolbarConfig"
                    :attachment-store="$props.attachmentStore"
                    :attachments="$props.attachments"
                    @preview-toggle-changed="setEditMode"
                    @save="commit(); hide();"
                    @reset="reset()"
                />
                <Codemirror
                    v-model="editorContent"
                    class="cm6"
                    placeholder="..."
                    :autofocus="true"
                    :indent-with-tab="true"
                    :tab-size="2"
                    :extensions="extensions"
                    @ready="handleReady"
                    @blur="onBlur"
                />
                <div class="editor-decoration editor-decoration-border" />
                <div class="editor-decoration editor-decoration-shadow" />
            </n-el>
        </transition>
        <Markdown
            v-if="!editMode && editorContent != ''"
            :dark-mode="editorStyle.darkMode"
            :value="editorContent"
            :image-interceptor="(e) => $props.markdownHandler.renderImage(e)"
            :image-updater="(e) => $props.markdownHandler.updateImage(e)"
            :link-click-interceptor="(e) => $props.markdownHandler.linkClicked(e)"
            @click="(e)=>e.defaultPrevented||setEditMode(true)"
        />
        <n-text
            v-if="!editMode && editorContent == ''"
            depth="3"
            @click="setEditMode(true)"
        >
            {{ $props.placeholder }}
        </n-text>
    </n-el>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue'
import { v1 as uuid } from "uuid";

import { minimalSetup, EditorView } from "codemirror"

import { dropCursor } from "@codemirror/view"

import type { EditorState } from '@codemirror/state'
import { markdown } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { autocompletion } from "@codemirror/autocomplete"

import ToolbarVue from "./Toolbar.vue"
import ToolbarConfig from "./ToolbarConfig"
import { fill as fillStyle } from "./EditorStyle"
import type { EditorStyle } from './EditorStyle'


import { isChildOfId, findNextTabable } from "@/utils/dom"
import Markdown from "../Markdown.vue"
import { VoidMarkdownHandler } from "./MarkdownHandler"
import type MarkdownHandler from "./MarkdownHandler"

import type { Store as AttachmentStore } from "@/common/attachments/Store";
import type CardAttachment from "@/common/data/CardAttachment";


const $props = withDefaults(defineProps<{
    value: string;
    editorStyle?: Partial<EditorStyle>;
    attachmentStore?: AttachmentStore;
    markdownHandler?: MarkdownHandler;
    attachments?: CardAttachment[];
    showToolbar?: boolean;
    toolbarConfig?: Partial<ToolbarConfig>;
    placeholder?: string;
    updateOnBlur?: boolean;
    updateOnCtrlEnter?: boolean;
    exitOnEsc?: boolean;
    clearAfterEdit?: boolean;
}>(),{
    markdownHandler: () => new VoidMarkdownHandler(),
    showToolbar: true,
    toolbarConfig: () => ToolbarConfig.withAll(),
    placeholder: "",
    updateOnBlur: false,
    updateOnCtrlEnter: true,
    exitOnEsc: true,
    clearAfterEdit: false,
    editorStyle: ()=>({}),
    attachmentStore: undefined,
    attachments: undefined,

});

const editorStyle = computed(() => fillStyle($props.editorStyle))

const domId = uuid()

const $emit = defineEmits(["update:value"]);

const editMode = ref(false)
const setEditMode = (value: boolean) => editMode.value = value

const toolbarId = uuid()

const commit = () => {
    if (editorContent.value != originalEditorContent) {
        $emit("update:value", editorContent.value)
    }
}

const reset = () => {
    editorContent.value = originalEditorContent
}

const hide = () => {
    editMode.value = false
    if ($props.clearAfterEdit) {
        editorContent.value = ""
    }
    nextFocus()
}

const onBlur = () => {
    const target = document.activeElement as Element
    if(isChildOfId(toolbarId, target) || target.className=="cm-content") {
        return false
    }

    if ($props.updateOnBlur) {
        commit()
    }

    hide()
}

const acceptFocus = () => {
    setEditMode(true)
}

const nextFocus = () => {
    const domElement = document.getElementById(domId)
    
    if (domElement == null) {
        return // maybe component not mounted???
    }
    
    const nextFocusable = findNextTabable(domElement)

    if(nextFocusable != null) {
        nextFocusable.focus()
    }
}

const originalEditorContent = ref($props.value).value
const editorContent = ref($props.value)


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

const cmTheme = {
    "&.cm-focused .cm-cursor": {
        borderLeftColor: editorStyle.value.darkMode? "var(--primary-color)" : "##fff",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: editorStyle.value.darkMode? "rgb(72, 72, 78)" : "#e2e2e2"
    },
}

const extensions = [
    EditorView.domEventHandlers({ // NOTICE the keyevents have to have the highest priority! Even higher than minimalSetup
        keyup(event) {
            if(event.keyCode == 13 && event.ctrlKey && $props.updateOnCtrlEnter){
                commit()
                hide()
                event.preventDefault()
                event.stopPropagation()
                return false
            }
        },
        keydown(event) {
            if(event.keyCode == 13 && event.ctrlKey && $props.updateOnCtrlEnter){
                event.preventDefault()
                event.stopPropagation()
                return false
            }

            if(event.keyCode == 27) {
                if ($props.exitOnEsc ) {
                    reset()
                    hide()
                }
                event.preventDefault()
                event.stopPropagation()
                return false
            }

        }
    }),
    minimalSetup,
    markdown({codeLanguages: languages}),
    EditorView.contentAttributes.of({spellcheck: "true"}),
    dropCursor(),
    autocompletion(/*{override: [myCompletions, myCompletions1]}*/),
    //    keymap.of([{key: "Alt-l", run: moveToLine}]),
    EditorView.domEventHandlers({
        dragover(event, _view) {
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
    }),
    EditorView.lineWrapping,
    EditorView.theme(cmTheme),
]

function dropText(view: EditorView, event: DragEvent, text: string, _direct: boolean) {
    // slight modification of https://github.com/codemirror/view/blob/1b7d7f1eb9bc809b717e21bee525d8c1393f33fa/src/input.ts#L537
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

.editor-root {
    position: relative;
    display: flex;
    flex-grow: 1;
}

.editor-root > div{
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-x: hidden;
}

.cm6 {
    display: block !important;
}

.preview {
    display: block;
    --overflow: hidden; /* hide top and bottom margins from inner content*/
}

.preview > :first-child{
  margin-top: 0;
}

.preview > :last-child{
  margin-bottom: 0;
}

.editor-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}

.editor-decoration-border {
    border: 1px solid var(--primary-color);
    border-radius: var(--n-border-radius);
}
.editor-decoration-shadow{
    box-shadow: 0 0 0 2px rgba(24, 160, 88, 0.2);
    border-radius: var(--n-border-radius);
}

.editor-enter-active .editor-decoration{
    transition: box-shadow .3s var(--n-bezier), border .3s var(--n-bezier);
}

.editor-enter-from .editor-decoration, .editor-leave-to .editor-decoration{
    border: none;
    box-shadow: none;
}

.cm-wrapper {
    display: block;
}

:deep() .cm-content, :deep() .cm-gutters {
    min-height: var(--minheight) !important;
}

:deep() .cm-editor.cm-focused {
  outline: 0;
}

</style>



