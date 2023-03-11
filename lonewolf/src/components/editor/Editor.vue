<template>
    <n-config-provider :theme="theme" class="editor-root">
        <n-el tag="div">
            <transition name="editor" :duration=".3">
                <n-el tag="div" class="editor" v-if="editMode">
                    <ToolbarVue :id="toolbarId" v-if="viewReady && $props.showToolbar && editMode" :editor-view="view as EditorView" @previewToggleChanged="setEditMode"
                                :toolbarConfig="$props.toolbarConfig"
                                :attachmentStore="$props.attachmentStore"
                                :attachments="$props.attachments"

                                @save="commit(); hide();"
                                @reset="reset()"
                                @addAttachment="emitAddAttachment"
                    />
                    <Codemirror
                        class="cm6"
                        placeholder="..."
                        :autofocus="true"
                        :indent-with-tab="true"
                        :tab-size="2"
                        :extensions="extensions"
                        v-model="editorContent"
                        @ready="handleReady"
                        @change="log"
                        @focus="log"
                        @blur="onBlur"
                    />
                    <div class="editor-decoration editor-decoration-border"></div>
                    <div class="editor-decoration editor-decoration-shadow"></div>
                </n-el>
            </transition >
            <!--<div class="preview" v-html="previewHtml" v-if="!editMode" @click="setEditMode(true)"></div>-->
            <Markdown
                v-if="!editMode" @click="(e)=>e.defaultPrevented||setEditMode(true)"
                :value="editorContent"
                :imageInterceptor="markdownHandler.image"
                :linkClickInterceptor="markdownHandler.linkClicked"
            />
            <n-text depth="3" v-if="editorContent=='' && !editMode" @click="setEditMode(true)">{{ $props.placeholder }}</n-text>
        </n-el>
    </n-config-provider>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useThemeVars } from 'naive-ui'
import { v1 as uuid } from "uuid";

import { minimalSetup, EditorView } from "codemirror"

import { dropCursor } from "@codemirror/view"

import type { EditorState } from '@codemirror/state'
import { markdown } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { autocompletion } from "@codemirror/autocomplete"

import ToolbarVue from "./Toolbar.vue"
import ToolbarConfig from "./ToolbarConfig"
import { isChildOfId } from "@/utils/dom"
import Markdown from "../Markdown.vue"

import type { Store as AttachmentStore } from "@/common/attachments/Store";
import type CardAttachment from "@/common/data/CardAttachment";

const $props = withDefaults(defineProps<{
    value: string
    attachmentStore?: AttachmentStore
    attachments?: CardAttachment[]
    showToolbar?: boolean
    toolbarConfig?: ToolbarConfig
    placeholder?: string
    updateOnBlur?: boolean
    updateOnCtrlEnter?: boolean
    exitOnEsc?: boolean
    clearAfterEdit?: boolean
}>(),{
    showToolbar: true,
    toolbarConfig: ()=>ToolbarConfig.withAll(),
    placeholder: "",
    updateOnBlur: false,
    updateOnCtrlEnter: true,
    exitOnEsc: true,
    clearAfterEdit: false,
});

const $emit = defineEmits(["update:value", "add-attachment"]);

const theme = useThemeVars()
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

const originalEditorContent = ref($props.value).value
const editorContent = ref($props.value)

//debug  helper
const log = ()=>false


const markdownHandler = {
    image(e: Element) {
        if ($props.attachmentStore && e.hasAttribute("src")) {
            $props.attachmentStore.url(e.getAttribute("src") as string).then((url)=>e.setAttribute("src", url)) // type annotation is ok because of hasAttribute("src")
        }

    },
    linkClicked(e: Event) {
        if ($props.attachmentStore && e.target != null && "hasAttribute" in e.target) {
            const element = e.target as Element
            if (element.hasAttribute("href") ) {
                $props.attachmentStore.url(element.getAttribute("href") as string).then((url)=>{ // type annotation is ok because of hasAttribute("href")
                    window.open(url, "_blank")
                })
            }
        }
        e.preventDefault()
        return false
    }
}

function emitAddAttachment(location: string, name: string, type: string){
    $emit('add-attachment', location, name, type)
}




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
    EditorView.lineWrapping
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
    width: calc(100% - 50px);
}

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

.editor {
}
.editor-decoration {
    position:absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;
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



