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
            <n-scrollbar class="scrollbar scroll-shadow-fixer-outer" >
                <div class="scroll-shadow-fixer-inner">
                    <n-space vertical>
                        <IconedBox icon="fluent:rename-20-filled" :contentOffsetX="12" :iconOffsetY="8">
                            <TextInput fontSize="20px" v-model:value="titleModel" @update:value="emitTitle" placeholder="Title" commitOnBlur commitOnEnter selectOnEdit/>
                        </IconedBox>
                        <IconedBox icon="fluent:tag-20-filled" :contentOffsetX="24">
                            <LabelSelector :labels="$props.labels" :activeLabels="activeLabels" :board="$props.board" @add="addLabel" @remove="removeLabel"/>
                        </IconedBox>
                        <IconedBox icon="fluent:timer-20-filled" :contentOffsetX="24">
                            <n-date-picker v-model:value="timestampModel" type="datetime" placeholder="Due Date" clearable size="small" />
                        </IconedBox>
                        <IconedBox icon="fluent:code-text-20-filled" :contentOffsetX="24">

                            <Editor v-model:value="descriptionModel"
                                    updateOnBlur
                                    placeholder="Add Description..."
                                    :attachmentStore="$props.board().attachmentStore()"
                                    :markdownHandler="markdownHandler"
                                    :attachments="attachments"
                                    @addAttachment="handleNewAttachment"

                            />
                        </IconedBox>
                        <IconedBox icon="fluent:document-20-filled" :contentOffsetX="24">
                            <AttachmentManager :attachments="attachments" @delete="handleDeleteAttachment" :board="$props.board" @add="handleNewAttachment" @edit="handleEditAttachment"/>
                        </IconedBox>
                        <IconedBox icon="fluent:comment-20-filled" :contentOffsetX="24">
                            <div style="display: flex;flex-grow: 1;flex-direction: column;gap: 8px;">
                                <Editor value=""
                                        @update:value="emitNewCommentTransaction"
                                        placeholder="Add Comment..."
                                        :toolbarConfig="ToolbarConfig.forNewComment()"
                                        :updateOnBlur="false"
                                        updateOnCtrlEnter
                                        exitOnEsc
                                        clearAfterEdit
                                        :attachmentStore="$props.board().attachmentStore()"
                                        @addAttachment="handleNewAttachment"

                                />
                            </div>
                        </IconedBox>
                        <IconedBox icon="fluent:timeline-20-filled" :contentOffsetX="24">
                            <n-space vertical style="flex-grow: 1;">
                                <n-space justify="right">
                                    <n-switch v-model:value="timelineShowDetailsModel">
                                        <template #checked>
                                            Show details
                                        </template>
                                        <template #unchecked>
                                            Hide details
                                        </template>
                                    </n-switch>
                                </n-space>
                                <CardDialogTimeline v-if="card != null" :show-details="timelineShowDetailsModel" :logbook="logbook" @transaction="(t)=>$emit('transaction', t)" :board="$props.board" :card="card" />
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

import { CardAddLabelTransaction, CardRemoveLabelTransaction, CardChangeTransaction, AddCommentTransaction, AddAttachmentTransaction } from "@/common/data/transactions/CardTransactions";
import { CardAttachmentChangeTransaction, CardAttachmentContentChangeTransaction } from "@/common/data/transactions/CardAttachmentTransactions";
import type Card from "@/common/data/Card";
import type Board from "@/common/data/Board";
import type { SDCardHolder, SDLabel } from "@/common/data/extern/SimpleData";
import type { Entry as LogEntry } from "@/common/logs/LogEntry";




import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(timezone)

const $props = defineProps<{
    cardHolder: SDCardHolder;
    board: () => Board;
    show: Ref<boolean>;
    labels: SDLabel[];
}>();

const $emit = defineEmits(["transaction", "update:show"]);

const emitTitle = (title: string) => $emit("transaction", new CardChangeTransaction($props.cardHolder.card.id, 'name', title))

const card = computed(()=>{$props.cardHolder.card.version; return $props.board().findCard($props.cardHolder.card.id)})

watch($props.cardHolder, ()=>{if(card.value!= null) setRefs(card.value)})

const activeLabels = computed(() => {
    if (card.value != null) {
        return card.value.labels.filter(l=>l.visibility);
    }
    return [];
})

const attachments = computed(() => {
    if (card.value != null) {
        return [...card.value.attachments.filter(a=>a.deleted != true)];
    }
    return [];
})

const titleModel = ref(card.value!=null?card.value.name:"")

let descriptionOriginal = card.value!=null?card.value.description:""
const descriptionModel = ref(card.value!=null?card.value.description:"")

watch(descriptionModel, () => {
    if (descriptionModel.value != descriptionOriginal) {
        $emit("transaction", new CardChangeTransaction($props.cardHolder.card.id, 'description', descriptionModel.value))
    }
})


const logbook = computed(()=>card.value == null?[]:card.value.logbook.map((tId)=>$props.board().logbook.get(tId)).filter(e=>e!=undefined) as LogEntry[])

const markdownHandler = new MarkdownHandler($props.board().attachmentStore())

const timelineShowDetailsModel = ref(false)

const emitNewCommentTransaction = (value: string) => {
    if (value != "") {
        $emit("transaction", new AddCommentTransaction($props.cardHolder.card.id, value))
    }
}

function handleNewAttachment(location: string, name: string, type: string) {
    if (card.value != null) {
        $emit('transaction', new AddAttachmentTransaction(card.value.id, location, name, type))
    }
}

function handleDeleteAttachment(attachmentId: string) {
    if (card.value != null) {
        $emit('transaction', new CardAttachmentChangeTransaction(card.value.id, attachmentId, 'deleted', true))
    }
}

function handleEditAttachment(id: string, location: string, name: string, mime: string) {
    if (card.value != null) {
        $emit('transaction', new CardAttachmentContentChangeTransaction(card.value.id, id, name, mime))
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
        $emit("transaction", new CardChangeTransaction($props.cardHolder.card.id, 'dueDate', timestampModel.value))
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
    $emit("transaction", new CardAddLabelTransaction($props.cardHolder.card.id, labelId))
}

function removeLabel(labelId: string) {
    $emit("transaction", new CardRemoveLabelTransaction($props.cardHolder.card.id, labelId))
}



</script>
<style scoped>
.card {
    width: 900px;
}

:deep() .card .n-card__content {
    padding-left: 32px;
    padding-right: 32px;
}

:deep() .scrollbar{
    height: calc(100vh - 222px) !important;
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

</style>
