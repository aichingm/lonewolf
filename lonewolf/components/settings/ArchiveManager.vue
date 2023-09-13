<template>
    <n-space vertical>
        <InitialFocus />
        <n-tabs type="line" animated default-value="Cards" justify-content="space-evenly">
            <n-tab-pane name="Cards" tab="Cards">
                <div v-if="$props.board.cardArchive.cards.length != 0" class="list-lane" >
                    <CardVue v-for="card in $props.board.cardArchive.cards" :key="card.id"
                             :card="card"
                             :board="$props.board"
                             :project="$props.project"
                    />
                </div>
                <n-empty v-else description="No archived cards!" class="empty-top-offset">
                </n-empty>
            </n-tab-pane>
            <n-tab-pane name="Lists" tab="Lists">
                <div v-if="$props.board.listArchive.length != 0" class="list-lane" >
                    <ListVue v-for="list in $props.board.listArchive" :key="list.id"
                             :list="list"
                             :project="$props.project"
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

import type { Board as BoardObservable } from "@/common/Observable";
import type Project from "@/common/Project";

const $props = defineProps<{
    project: Project;
    board: BoardObservable;
}>();


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
