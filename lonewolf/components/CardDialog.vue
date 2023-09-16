<template>
    <n-modal v-model:show="showModel" class="component-root">
        <n-card
            class="card"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
            tabindex="0"
            content-style="padding-left: 32px; padding-right: 32px;"
        >
            <InitialFocus />
            <n-scrollbar class="scrollbar" >
                <div class="scroll-shadow-fixer-inner">
                    <n-space vertical>
                        <IconedBox icon="fluent:rename-20-filled" :contentOffsetX="12" :iconOffsetY="8">
                            <TextInput fontSize="20px" v-model:value="titleModel" @update:value="emitTitle" placeholder="Title" commitOnBlur commitOnEnter selectOnEdit/>
                        </IconedBox>
                        <IconedBox icon="fluent:tag-20-filled" :contentOffsetX="24">
                            <LabelSelector :project="$props.project" :activeLabels="activeLabels" :board="$props.board" @add="addLabel" @remove="removeLabel"/>
                        </IconedBox>
                        <IconedBox icon="fluent:timer-20-filled" :contentOffsetX="24">
                            <n-date-picker v-model:value="timestampModel" type="datetime" placeholder="Due Date" clearable size="small" />
                        </IconedBox>
                        <IconedBox icon="fluent:code-text-20-filled" :contentOffsetX="24">
                            <Editor v-model:value="descriptionModel"
                                    updateOnBlur
                                    placeholder="Add Description..."
                                    :attachmentStore="$props.project.board.attachmentStore()"
                                    :markdownHandler="markdownHandler"
                                    :attachments="attachments"
                                    @addAttachment="handleNewAttachment"
                                    :editorStyle="editorTheme"
                            />
                        </IconedBox>
                        <IconedBox icon="fluent:document-20-filled" :contentOffsetX="24">
                            <AttachmentManager :attachments="attachments" @delete="handleDeleteAttachment" :project="$props.project" :board="$props.board" @add="handleNewAttachment" @edit="handleEditAttachment"/>
                        </IconedBox>
                        <IconedBox icon="fluent:comment-20-filled" :contentOffsetX="24">
                            <div class="editor-container">
                                <Editor value=""
                                        @update:value="emitNewCommentTransaction"
                                        placeholder="Add Comment..."
                                        :toolbarConfig="ToolbarConfig.forNewComment()"
                                        :updateOnBlur="false"
                                        updateOnCtrlEnter
                                        exitOnEsc
                                        clearAfterEdit
                                        :attachmentStore="$props.project.board.attachmentStore()"
                                        @addAttachment="handleNewAttachment"
                                        :editorStyle="editorTheme"
                                />
                            </div>
                        </IconedBox>
                        <IconedBox icon="fluent:timeline-20-filled" :contentOffsetX="24">
                            <n-space vertical class="flex-grow">
                                <n-space justify="right">
                                    <n-switch v-model:value="timelineShowDetailsModel">
                                    </n-switch>
                                </n-space>
                                <CardDialogTimeline 
                                    v-if="card != null"
                                    :show-details="timelineShowDetailsModel"
                                    :logbook="logbook"
                                    :project="$props.project"
                                    :card="card"
                                    :appSettings="$props.appSettings"
                                />
                            </n-space>
                        </IconedBox>
                        <div>&nbsp;<!-- this is needed to allow the editor to blur, remove when adding a new iconed box below the editor--></div>
                    </n-space>
                </div>
            </n-scrollbar>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { Ref } from "vue";

import Editor from "@/components/editor/Editor.vue";
import ToolbarConfig from "@/components/editor/ToolbarConfig";
import { MarkdownHandler } from "@platform/MarkdownHandler";

import TextInput from "@/components/inputs/TextInput.vue";
import IconedBox from "@/components/IconedBox.vue";
import InitialFocus from "@/components/InitialFocus.vue";
import CardDialogTimeline from "@/components/timeline/CardDialogTimeline.vue";

import LabelSelector from "@/components/labels/LabelSelector.vue";
import AttachmentManager from "@/components/attachments/AttachmentManager.vue";

import { useTransactions } from './transactions/api'
import { CardAddLabelTransaction, CardRemoveLabelTransaction, CardChangeTransaction, AddCommentTransaction, AddAttachmentTransaction } from "@/common/transactions/CardTransactions";
import { CardAttachmentChangeTransaction, CardAttachmentContentChangeTransaction } from "@/common/transactions/CardAttachmentTransactions";

import type Card from "@/common/data/Card";
import type Label from "@/common/data/Label";
import type Project from "@/common/Project";
import type Settings from "@/common/settings/AppSettings";


import type { Board as BoardObservable, Card as CardObservable } from "@/common/Observable";
import type { Entry as LogEntry } from "@/common/logs/LogEntry";

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(timezone)

const $props = defineProps<{
    project: Project;
    cardObservable: CardObservable;
    board: BoardObservable;
    show: Ref<boolean>;
    appSettings: Settings;
}>();

const $emit = defineEmits(["update:show"]);

const transactions = useTransactions()

const editorTheme = computed(()=>({
    darkMode: $props.appSettings.darkMode,
}))

const emitTitle = (title: string) => transactions.commit(new CardChangeTransaction($props.cardObservable.id, 'name', title))

const card = computed(()=>{$props.cardObservable.version; return $props.project.board.findCard($props.cardObservable.id)})

watch(card, ()=>{if(card.value!= null) setRefs(card.value)})

const activeLabels = computed(() => {
    if (card.value != null) {
        return card.value.labels.filter((l: Label)=>l.visibility);
    }
    return [];
})

const attachments = computed(() => {
    if (card.value != null) {
        return [...card.value.attachments.filter((a)=>a.deleted != true)];
    }
    return [];
})

const titleModel = ref(card.value!=null?card.value.name:"")

let descriptionOriginal = card.value!=null?card.value.description:""
const descriptionModel = ref(card.value!=null?card.value.description:"")

watch(descriptionModel, () => {
    if (descriptionModel.value != descriptionOriginal) {
        transactions.commit(new CardChangeTransaction($props.cardObservable.id, 'description', descriptionModel.value))
    }
})


const logbook = computed(
    () => card.value == null ? [] : card.value.logbook.map(tId=>$props.project.board.logbook.get(tId)).filter((e)=>e!=undefined) as LogEntry[])

const markdownHandler = new MarkdownHandler($props.project.board.attachmentStore())

const timelineShowDetailsModel = ref(false)

const emitNewCommentTransaction = (value: string) => {
    if (value != "") {
        transactions.commit(new AddCommentTransaction($props.cardObservable.id, value))
    }
}

function handleNewAttachment(location: string, name: string, type: string) {
    if (card.value != null) {
        transactions.commit(new AddAttachmentTransaction(card.value.id, location, name, type))
    }
}

function handleDeleteAttachment(attachmentId: string) {
    if (card.value != null) {
        transactions.commit(new CardAttachmentChangeTransaction(card.value.id, attachmentId, 'deleted', true))
    }
}

function handleEditAttachment(id: string, location: string, name: string, mime: string) {
    if (card.value != null) {
        transactions.commit(new CardAttachmentContentChangeTransaction(card.value.id, id, name, mime))
    }
}

function timestampOrNull(timestamp: number | null): number | null {
    if(timestamp == null || card.value == null){
        return null
    }
    return card.value.dueDate
}

let timestampOriginal = card.value != null ? timestampOrNull(card.value.dueDate): null
const timestampModel = ref(card.value != null ? timestampOrNull(card.value.dueDate): null)

watch(timestampModel, ()=> {
    if (timestampModel.value != timestampOriginal) {
        transactions.commit(new CardChangeTransaction($props.cardObservable.id, 'dueDate', timestampModel.value))
    }
})

const setRefs = (card: Card) => {
    titleModel.value = card.name
    descriptionOriginal = card.description
    descriptionModel.value = card.description
    timestampOriginal = timestampOrNull(card.dueDate)
    timestampModel.value = timestampOrNull(card.dueDate)
}

const showModel = ref(true)
watch($props.show, ()=>{showModel.value = $props.show.value;})
watch(showModel, ()=>$emit("update:show", showModel))


function addLabel(labelId: string) {
    transactions.commit(new CardAddLabelTransaction($props.cardObservable.id, labelId))
}

function removeLabel(labelId: string) {
    transactions.commit(new CardRemoveLabelTransaction($props.cardObservable.id, labelId))
}



</script>
<style scoped>
.card {
    width: 900px;
}

:deep() .card .n-card__content {
    padding-left: 32px;
    padding-right: 30px; /* IconedBox has 2px margin-right*/
}

:deep() .scrollbar{
    height: calc(100vh - 222px) !important;
    padding-right: 12px; /* move the scrollbar to the right so that it does not overlay the content */
}

.scroll-shadow-fixer-inner {
    padding-top: 2px;
    padding-bottom: 2px;
}

.comment {
    background-color: #f5f5f5ab;
    border-radius: 3px;
    box-shadow: 0 8px 6px -6px #b5b5b5;
    padding: 8px;
}

.block {
    display: block;
}

.editor-container {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    gap: 8px;
}

.flex-grow {
    flex-grow: 1;
}

</style>
