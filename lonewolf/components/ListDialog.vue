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
                            <TextInput fontSize="20px" v-model:value="titleModel" @update:value="emitTitle" placeholder="Title" commitOnBlur commitOnEnter selectOnEdit/>
                        </IconedBox>
                        <IconedBox icon="fluent:book-question-mark-20-filled" :contentOffsetX="24" :iconOffsetY="8">
                            <n-space class="flex-grow" justify="space-between" align="center">Cards are Closed
                                <n-switch :round="false" :value="cardsClosed" @update:value="handleCardsAreClosedChanged"/>
                            </n-space>
                        </IconedBox>
                        <IconedBox icon="fluent:timeline-20-filled" :contentOffsetX="24">
                            <ListDialogTimeline v-if="list != null" :logbook="logbook" @transaction="(t)=>$emit('transaction', t)" :board="$props.board" :list="list" />
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
import { ListChangeTransaction } from "@/common/data/transactions/ListTransactions";
import type List from "@/common/data/List";
import type Board from "@/common/data/Board";
import type { SDListHolder } from "@/common/data/extern/SimpleData";
import ListDialogTimeline from "@/components/timeline/ListDialogTimeline.vue";
import type { Entry as LogEntry } from "@/common/logs/LogEntry";




const $props = defineProps<{
    listHolder: SDListHolder;
    board: () => Board;
    show: Ref<boolean>;
}>();

const $emit = defineEmits(["transaction", "update:show"]);

const emitTitle = (title: string) => $emit("transaction", new ListChangeTransaction($props.listHolder.list.id, 'name', title))

const list = computed(()=>{$props.listHolder.list.version; return $props.board().findList($props.listHolder.list.id)})

watch($props.listHolder, ()=>{if(list.value != null) setRefs(list.value)})

const logbook = computed(()=>list.value == null?[]:list.value.logbook.map((tId)=>$props.board().logbook.get(tId)).filter(e=>e!=undefined) as LogEntry[])

const showModel = ref(true)
watch($props.show, ()=>{showModel.value = $props.show.value;})
watch(showModel, ()=>$emit("update:show", showModel))

const titleModel = ref(list.value!=null?list.value.name:"")
const cardsClosed = ref(list.value!=null?list.value.cardsAreClosed:false)

const setRefs = (list: List) => {
    titleModel.value = list.name
    cardsClosed.value = list.cardsAreClosed
}

function handleCardsAreClosedChanged (value: boolean) {
    cardsClosed.value = value
    $emit("transaction", new ListChangeTransaction($props.listHolder.list.id, 'cardsAreClosed', cardsClosed.value))
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
