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
                            />
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
                                />
                                <n-timeline>
                                    <n-timeline-item v-for="comment in comments" :key="comment.id" type="info">
                                        <n-space justify="space-between" align="center" style="height: 34px;">
                                            <n-space >
                                                <n-text depth="3">You commented <AutoTime :data="comment.createdAt" /></n-text>
                                            </n-space>
                                            <n-space>
                                                <n-button-group>
                                                    <!--<n-button round size='tiny' ghost color="rgb(118, 124, 130)" quaternary>
                                                    edit
                                                </n-button>-->
                                                    <n-popconfirm :show-icon="false" :negative-text="'Delete it'" :positive-text="'Oh, nevermind'" :negative-button-props="{type:'error'}" :positive-button-props="{type:'default'}" @negative-click="handleDeleteComment(comment)">
                                                        <template #trigger>
                                                            <n-button round size='tiny' color="rgb(118, 124, 130)" quaternary>
                                                                delete
                                                            </n-button>
                                                        </template>
                                                        Deleting a comment can not be  undone, are U sure?
                                                    </n-popconfirm>
                                                </n-button-group>
                                            </n-space>
                                        </n-space>

                                        <div class="comment">
                                            <Editor :value="comment.content"
                                                    @update:value="(value: string)=>handleEditComment(comment, value)"
                                                    placeholder=""
                                                    :toolbarConfig="ToolbarConfig.forComment()"
                                                    :updateOnBlur="true"
                                                    updateOnCtrlEnter
                                                    exitOnEsc
                                            />
                                        </div>

                                        <template #icon>
                                            <n-icon>
                                                <icon icon="fluent:comment-20-regular" />
                                            </n-icon>
                                        </template>
                                    </n-timeline-item>
                                </n-timeline>

                            </div>
                        </IconedBox>
                        <div>&nbsp;<!-- this is needed to allow the editor to blur, remove when adding a new iconed box below the editor--></div>
                    </n-space>
                </div>
            </n-scrollbar>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import Editor from "@/components/editor/Editor.vue";
import ToolbarConfig from "@/components/editor/ToolbarConfig";
import LabelSelector from "@/components/labels/LabelSelector.vue";
import { ref, watch, computed } from "vue";
import type { Ref } from "vue";
import InitialFocus from "@/components/InitialFocus.vue";
import IconedBox from "@/components/IconedBox.vue";
import TextInput from "@/components/inputs/TextInput.vue";
import AutoTime from "@/components/AutoTime.vue";
import { CardRenameTransaction, CardDescriptionTransaction, CardAddLabelTransaction, CardRemoveLabelTransaction } from "@/common/data/Transaction";
import { DueDateTransaction, AddCommentTransaction } from "@/common/data/transactions/CardTransactions";
import { CardCommentChangeTransaction } from "@/common/data/transactions/CardCommentTransactions";
import type Card from "@/common/data/Card";
import type CardComment from "@/common/data/CardComment";
import type Board from "@/common/data/Board";
import type { SDCardHolder, SDLabel } from "@/common/data/extern/SimpleData";


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

const emitTitle = (title: string) => $emit("transaction", new CardRenameTransaction($props.cardHolder.card.id, title))

const card = computed(()=>{$props.cardHolder.card.version; return $props.board().findCard($props.cardHolder.card.id)})

watch($props.cardHolder, ()=>{if(card.value!= null) setRefs(card.value)})

const activeLabels = computed(() => {
    if (card.value != null) {
        return card.value.labels.filter(l=>l.visibility);
    }
    return [];
})

const titleModel = ref(card.value!=null?card.value.name:"")

let descriptionOriginal = card.value!=null?card.value.description:""
const descriptionModel = ref(card.value!=null?card.value.description:"")

watch(descriptionModel, () => {
    if (descriptionModel.value != descriptionOriginal) {
        $emit("transaction", new CardDescriptionTransaction($props.cardHolder.card.id, descriptionModel.value))
    }
})

const comments = computed(()=>card.value == null?[]:Array.from(card.value.comments).filter(c=>!c.deleted).reverse() )

const emitNewCommentTransaction = (value: string) => {
    if (value != "") {
        $emit("transaction", new AddCommentTransaction($props.cardHolder.card.id, value))
    }
}

function handleDeleteComment(comment: CardComment) {
    if (card.value != null) {
        $emit('transaction', new CardCommentChangeTransaction(card.value.id, comment.id, 'deleted', true))
    }
}

function handleEditComment(comment: CardComment, value: string) {
    if (card.value != null) {
        $emit('transaction', new CardCommentChangeTransaction(card.value.id, comment.id, 'content', value))
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
        $emit("transaction", new DueDateTransaction($props.cardHolder.card.id, timestampModel.value))
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


</style>
