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
                            <n-space class="flex-grow" justify="space-between" align="center">Cards are Closed <n-switch :round="false" v-model:value="cardsClosed" /></n-space>
                        </IconedBox>
                    </n-space>
                </div>
            </n-scrollbar>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Ref } from "vue";
import InitialFocus from "@/components/InitialFocus.vue";
import TextInput from "@/components/inputs/TextInput.vue";
import IconedBox from "@/components/IconedBox.vue";
import { ListChangeTransaction } from "@/common/data/transactions/ListTransactions";
import type List from "@/common/data/List";
import type Board from "@/common/data/Board";


const $props = defineProps<{
    id: Ref<string>;
    board: () => Board;
    show: Ref<boolean>;
}>();

const $emit = defineEmits(["transaction", "update:show"]);

const emitTitle = (title: string) => $emit("transaction", new ListChangeTransaction($props.id.value, 'name', title))

const titleModel = ref("")
const cardsClosed = ref(false)
const showModel = ref(false)

const reloadList = () => {
    const list =  $props.board().findList($props.id.value);
    if(list != null) setRefs(list)
}

const setRefs = (list: List) => {
    titleModel.value = list.name
    cardsClosed.value = list.cardsAreClosed
}

watch(cardsClosed, ()=>{
    $emit("transaction", new ListChangeTransaction($props.id.value, 'cardsAreClosed', cardsClosed.value))
})

watch($props.id, ()=>reloadList())
watch($props.show, () => showModel.value = $props.show.value)
watch(showModel, ()=>{
    $emit("update:show", showModel)
    reloadList()
})


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
