<template>
    <n-modal
        v-model:show="showModel"
    >
        <n-card
            class="card"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
            content-style="padding-left: 32px; padding-right: 32px;"
        >
            <InitialFocus />
            <n-scrollbar class="scrollbar scroll-shadow-fixer-outer" >
                <div class="scroll-shadow-fixer-inner">
                    <n-space vertical>
                        <IconedBox icon="fluent:rename-20-filled" :contentOffsetX="12" :iconOffsetY="8">
                            <TextInput fontSize="20px" :value="data?.list.name||''" @update:value="emitTitle" placeholder="Title" commitOnBlur commitOnEnter selectOnEdit/>
                        </IconedBox>
                        <IconedBox icon="fluent:book-question-mark-20-filled" :contentOffsetX="24" :iconOffsetY="8">
                            <n-space class="flex-grow" justify="space-between" align="center">Cards are Closed
                                <n-switch :round="false" :value="data?.list.cardsAreClosed||false" @update:value="handleCardsAreClosedChanged"/>
                            </n-space>
                        </IconedBox>
                        <IconedBox icon="fluent:number-symbol-square-20-filled" :contentOffsetX="24">
                            <n-space class="flex-grow" justify="space-between" align="center">Card Limit
                                <n-space align="center">
                                    <n-switch :round="false" :value="data?.list.enableCardLimit||false" @update:value="handleEnableCardLimitChanged"/>
                                    <n-input-number
                                        :disabled="!(data?.list.enableCardLimit==undefined?false:data?.list.enableCardLimit)"
                                        :value="data?.list.actualCardLimit()"
                                        placeholder="#"
                                        :min="0"
                                        @update:value="handleCardLimitChanged"
                                    />
                                </n-space>
                            </n-space>
                        </IconedBox>
                        <IconedBox icon="fluent:timeline-20-filled" :contentOffsetX="24">
                            <ListDialogTimeline v-if="data != null" :logbook="data?.logbook||[]" :board="$props.board" :list="data.list" />
                        </IconedBox>
                    </n-space>
                </div>
            </n-scrollbar>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { Ref } from "vue";
import InitialFocus from "@/components/InitialFocus.vue";
import TextInput from "@/components/inputs/TextInput.vue";
import IconedBox from "@/components/IconedBox.vue";

import { useTransactions } from '@/components/transactions/api'
import { ListChangeTransaction } from "@/common/transactions/ListTransactions";

import type Project from "@/common/Project";
import type { List as ListObservable, Board as BoardObservable } from "@/common/Observable";
import ListDialogTimeline from "@/components/timeline/ListDialogTimeline.vue";
import type { Entry as LogEntry } from "@/common/logs/LogEntry";

const $props = defineProps<{
    project: Project;
    listObservable: ListObservable;
    board: BoardObservable;
    show: Ref<boolean>;
}>();

const $emit = defineEmits(["update:show"]);

const transactions = useTransactions()

const emitTitle = (title: string) => transactions.commit(new ListChangeTransaction($props.listObservable.id, 'name', title))

const data = computed(()=>{

    const list = $props.project.board.findList($props.listObservable.id)

    if (list != null) {
        const logbook = list.logbook.map((tId)=>$props.project.board.logbook.get(tId)).filter(e=>e!=undefined) as LogEntry[]

        return {
            list: list,
            logbook: logbook,
            version: $props.listObservable.version,
        }
    }
    return null
})

/*const titleModel = ref(data.value?.list.name||"")
const cardsClosed = ref(data.value?.list.cardsAreClosed||false)

watch(data, ()=>{
    titleModel.value = ref(data.value?.list.name||"")
    cardsClosed.value = ref(data.value?.list.cardsAreClosed||false)
})
*/

const showModel = ref(true)
watch($props.show, ()=>{showModel.value = $props.show.value;})
watch(showModel, ()=>$emit("update:show", showModel))

function handleCardsAreClosedChanged (value: boolean) {
    transactions.commit(new ListChangeTransaction($props.listObservable.id, 'cardsAreClosed', value))
}


function handleEnableCardLimitChanged (value: boolean) {
    transactions.commit(new ListChangeTransaction($props.listObservable.id, 'enableCardLimit', value))
}


function handleCardLimitChanged (value: number) {
    transactions.commit(new ListChangeTransaction($props.listObservable.id, 'cardLimit', value))
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

.flex-grow {
    flex-grow: 1;
}
</style>
