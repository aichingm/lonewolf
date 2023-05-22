<template>
    <n-space vertical>
        <InitialFocus />
        <n-tabs type="line" animated default-value="Cards" justify-content="space-evenly">
            <n-tab-pane name="Cards" tab="Cards">
                <div v-if="$props.cardArchive.cards.length != 0" class="list-lane" >
                    <CardVue v-for="card in $props.cardArchive.cards" :key="card.id"
                             :card="card"
                             :board="$props.board"
                             :lists="$props.lists"
                             :cards="[]"
                             :labels="$props.labels"
                             @transaction="(t)=>$emit('transaction', t)"
                    />
                </div>
                <n-empty v-else description="No archived cards!" class="empty-top-offset">
                </n-empty>
            </n-tab-pane>
            <n-tab-pane name="Lists" tab="Lists">
                <div v-if="$props.listArchive.length != 0" class="list-lane" >
                    <ListVue v-for="list in $props.listArchive" :key="list.id"
                             :list="list"
                             :board="$props.board"
                             @transaction="(t)=>$emit('transaction', t)"
                    />
                </div>
                <n-empty v-else description="No archived lists!" class="empty-top-offset">
                </n-empty>

            </n-tab-pane>
        </n-tabs>
    </n-space>
</template>


<script setup lang="ts">
import CardVue from "./ArchivedCard.vue";
import ListVue from "./ArchivedList.vue";
import InitialFocus from "@/components/InitialFocus.vue";

import type Board from "@/common/data/Board";
import type { SDList, SDLabel} from "@/common/data/extern/SimpleData";

const $props = defineProps<{
    board: () => Board;
    labels: SDLabel[];
    cardArchive: SDList;
    listArchive: SDList[];
    lists: SDList[];
}>();

const $emit = defineEmits(["transaction"]);

</script>
<style scoped>

.list-lane {
    overflow: auto;
    height: calc(100vh - 414px);
    display: flex;
    flex-direction: column;
    gap: 10px 10px;
    background-color: #e9e9ed;
    margin-top: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    border-radius: 4px 4px 4px 4px;
}

.empty-top-offset {
    margin-top: 200px;
}


</style>
