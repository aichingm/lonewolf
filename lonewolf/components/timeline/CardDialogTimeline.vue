<template>
    <n-timeline>
        <n-timeline-item
            v-for="entry in logbookEntries"
            :key="entry.id"
            :type="computeType(entry)"
        >
            <!-- IF -->
            <div v-if="typeOf(entry) == TimelineKind.CommentAdd">
                <n-space
                    class="line-height"
                    justify="space-between"
                >
                    <n-space>
                        <n-text depth="3">
                            {{ computeText(entry) }} <AutoTime :data="entry.timestamp" />
                        </n-text>
                    </n-space>
                    <n-space>
                        <n-button-group>
                            <n-popconfirm
                                :show-icon="false"
                                :negative-text="'Delete it'"
                                :positive-text="'Oh, nevermind'"
                                :negative-button-props="{type:'error'}"
                                :positive-button-props="{type:'default'}"
                                @negative-click="handleDeleteComment(entry)"
                            >
                                <template #trigger>
                                    <n-button
                                        round
                                        size="tiny"
                                        color="rgb(118, 124, 130)"
                                        quaternary
                                    >
                                        delete
                                    </n-button>
                                </template>
                                Deleting a comment can not be  undone, are U sure?
                            </n-popconfirm>
                        </n-button-group>
                    </n-space>
                </n-space>
                <div class="comment">
                    <Editor
                        :value="commentOf(entry).content"
                        placeholder=""
                        :toolbar-config="ToolbarConfig.forComment()"
                        :update-on-blur="true"
                        update-on-ctrl-enter
                        exit-on-esc
                        :attachment-store="$props.project.board.attachmentStore()"
                        :markdown-handler="markdownHandler"
                        :editor-style="editorTheme"
                        @update:value="(value: string)=>handleEditComment(entry, value)"
                        @add-attachment="(location: string, name: string, type: string)=>handleNewAttachment(entry, location, name, type)"
                    />
                </div>
            </div>
            <!-- ELSE -->
            <n-space
                v-else
                justify="space-between"
                align="center"
            >
                <n-space>
                    <n-text depth="3">
                        {{ computeText(entry) }} <AutoTime :data="entry.timestamp" />
                    </n-text>
                </n-space>
            </n-space>
            <!-- FI -->
            <template #icon>
                <n-icon>
                    <icon :icon="computeIcon(entry)" />
                </n-icon>
            </template>
        </n-timeline-item>
    </n-timeline>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { Entry as LogEntry, Action as LogAction } from "@/common/logs/LogEntry";

import { typeOf, Kind as TimelineKind } from "./card-timeline";
import AutoTime from "@/components/AutoTime.vue";

import Editor from "@/components/editor/Editor.vue";
import ToolbarConfig from "@/components/editor/ToolbarConfig";

import { MarkdownHandler } from "@platform/MarkdownHandler";

import { useTransactions } from '@/components/transactions/api'
import { AddAttachmentTransaction } from "@/common/transactions/CardTransactions";
import { CardCommentChangeTransaction } from "@/common/transactions/CardCommentTransactions";

import type Project from "@/common/Project";
import type Card from "@/common/data/Card";
import type CardComment from "@/common/data/CardComment";
import type Settings from "@/common/settings/AppSettings";


const $props = defineProps<{
    card: Card;
    project: Project;
    logbook: LogEntry[];
    showDetails: boolean;
    appSettings: Settings;
    darkMode: boolean;
}>();

const transactions = useTransactions()

const editorTheme = computed(()=>({
    darkMode: $props.darkMode,
}))

const logbookEntries = computed(()=>{
    if($props.showDetails){
        return $props.logbook.filter(e=>e!=undefined && typeOf(e) != TimelineKind.None && filterDeletedComments(e)).reverse()
    }else{
        return $props.logbook.filter(e=>e!=undefined && typeOf(e) == TimelineKind.CommentAdd && filterDeletedComments(e)).reverse()
    }
})

const markdownHandler = new MarkdownHandler($props.project.board.attachmentStore())

function filterDeletedComments(entry: LogEntry) {
    return typeOf(entry) != TimelineKind.CommentAdd || $props.card.comments.find(e=>e.id == entry.objectId && e.deleted == false) != undefined
}

function computeType(entry:LogEntry): string {
    switch(entry.action) {
    case LogAction.Delete:
    case LogAction.Disconnect:
        return "warning"
    case LogAction.Create:
    case LogAction.Connect:
        return "success"
    case LogAction.Change:
    default:
        return "info"
    }
}

function computeIcon(entry:LogEntry): string {
    const t = typeOf(entry)
    switch (t) {
    case TimelineKind.LabelAdd:
        return 'fluent:tag-20-regular'
    case TimelineKind.LabelRemove:
        return 'fluent:tag-dismiss-20-regular'
    case TimelineKind.AttachmentAdd:
        return 'fluent:document-add-20-regular'
    case TimelineKind.AttachmentRemove:
        return 'fluent:document-dismiss-20-regular'
    case TimelineKind.CommentAdd:
        return 'fluent:comment-add-20-regular'
    case TimelineKind.CommentRemove:
        return 'fluent:comment-dismiss-20-regular'
    case TimelineKind.NewCard:
        return 'fluent:tab-add-20-regular'
    case TimelineKind.CardMove:
        return 'fluent:arrow-exit-20-regular'
    default:
        return "fluent:pen-20-regular"
    }
}

function computeText(entry: LogEntry): string{
    const t = typeOf(entry)
    switch (t) {
    case TimelineKind.LabelAdd:
        return initiator(entry) + ' added the ' + $props.project.board.findLabel(entry.objectId)?.name + ' label'
    case TimelineKind.LabelRemove:
        return initiator(entry) + ' removed the ' + $props.project.board.findLabel(entry.objectId)?.name + ' label'
    case TimelineKind.AttachmentAdd:
        return initiator(entry) + ' added ' + entry.args[0] + '  as attachment'
    case TimelineKind.AttachmentRemove:
        return initiator(entry) + ' deleted ' + entry.args[0] + '  as attachment'
    case TimelineKind.AttachmentChange:
        return initiator(entry) + ' changed the contents of ' + entry.args[0] + ' '
    case TimelineKind.CommentAdd:
        return initiator(entry) + ' added a comment'
    case TimelineKind.CommentRemove:
        return initiator(entry) + ' deleted a comment'
    case TimelineKind.NewCard:
        return initiator(entry) + ' created this card'
    case TimelineKind.PropertyChange:
        return initiator(entry) + ' changed the ' + fieldToText(entry) + ' of this card'
    case TimelineKind.CardMove:
        return initiator(entry) + ' moved the card to ' + $props.project.board.findListInclArchives(entry.args[2])?.name
    default:
        throw new Error("Can not compute text for LogEntry[" + entry.id + "]")
    }
}

function initiator(entry: LogEntry): string {
    return entry.initiator == "self" ? "You" : entry.initiator
}

function fieldToText(entry: LogEntry): string {
    switch (entry.objectId) {
    case "description":
        return "description"
    case "dueDate":
        return "due date"
    case "name":
        return "title"
    default:
        return "something"
    }
}

function commentOf(entry: LogEntry): CardComment{
    const comment = $props.card.comments.find(e=>e.id == entry.objectId)
    if (comment == undefined) {
        throw new Error("CardComment[" + entry.objectId + "] not found on Card[" + entry.subjectId + "]")
    }
    return comment
}

function handleNewAttachment(entry: LogEntry, location: string, name: string, type: string) {
    transactions.commit(new AddAttachmentTransaction(entry.subjectId, location, name, type))
}

function handleDeleteComment(entry: LogEntry) {
    transactions.commit(new CardCommentChangeTransaction(entry.subjectId, entry.objectId, 'deleted', true))
}

function handleEditComment(entry: LogEntry, value: string) {
    transactions.commit(new CardCommentChangeTransaction(entry.subjectId, entry.objectId, 'content', value))
}

</script>
<style scoped>
.line-height {
    height: 34px;
}
</style>
