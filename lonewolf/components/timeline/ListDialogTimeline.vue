<template>
    <n-timeline>
        <n-timeline-item v-for="entry in logbookEntries" :key="entry.id" :type="computeType(entry)">
            <n-space justify="space-between" align="center" >
                <n-space>
                    <n-text depth="3">{{ computeText(entry) }} <AutoTime :data="entry.timestamp" /></n-text>
                </n-space>
            </n-space>
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

import { typeOf, Kind as TimelineKind } from "./list-timeline";
import AutoTime from "@/components/AutoTime.vue";

import type List from "@/common/data/List";


const $props = defineProps<{
    list: List;
    logbook: LogEntry[];
}>();
const logbookEntries = computed(()=> $props.logbook.filter(e=>e != undefined && typeOf(e) != TimelineKind.None).reverse())

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
    case TimelineKind.NewList:
        return 'fluent:tab-add-20-regular'
    default:
        return "fluent:pen-20-regular"
    }
}

function computeText(entry: LogEntry): string{
    const t = typeOf(entry)
    switch (t) {
    case TimelineKind.NewList:
        return initiator(entry) + ' created this list'
    case TimelineKind.ArchivedChange:
        return initiator(entry) + ' ' + (entry.args[0]=="true"?'':'un') + 'archived this list'
    case TimelineKind.PropertyChange:
        return initiator(entry) + ' changed the ' + fieldToText(entry) + ' of this list'
    default:
        throw new Error("Can not compute text for LogEntry[" + entry.id + "]")
    }
}

function initiator(entry: LogEntry): string {
    return entry.initiator == "self" ? "You" : entry.initiator
}

function fieldToText(entry: LogEntry): string {
    switch (entry.objectId) {
    case "name":
        return "title"
    case "cardsAreClosed":
        return "'Cards are Closed' setting"
    case "enableCardLimit":
        return "'Enable Card Limit' setting"
    case "cardLimit":
        return "'Card Limit' setting"
    default:
        return "something"
    }
}


</script>
<style scoped>

</style>
