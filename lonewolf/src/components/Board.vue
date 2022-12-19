<template>
    <div class="board">
        <draggable
            v-model="lists"
            group="lists"
            animation="200"
            ghostClass="ghost-card"
            dragClass="drag-card"
            item-key="id"
            handle=".list-dragger"
            @change="dragEvent($event)"
        >
            <template #item="{ element }">
                <ListVue
                    :board="$props.board"
                    :data="element"
                    :lists="$props.data.nodes"
                    @card-edit="(card)=>$emit('card-edit', card)"
                    @list-edit="(list)=>$emit('list-edit', list)"
                    @transaction="(...args)=>$emit('transaction', ...args)"
                />
            </template>
        </draggable>
        <NewList @newList="newList" />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import draggable from "vuedraggable";


import ListVue from "./List.vue";
import NewList from "./NewList.vue";

import { TransactionTree, NewListTransaction, ListSortTransaction } from "@/common/data/Transaction";
import type Board from "@/common/data/Board";

import type List from "@/common/data/List";

const $props = defineProps<{
    board: () => Board;
    data: TransactionTree;
}>();

const $emit = defineEmits(["transaction", "card-edit", "list-edit"]);
const lists = computed(()=>$props.data.nodes)

function newList(title: string) {
    $emit("transaction", new NewListTransaction(title))
}

function dragEvent(e: {moved: {element: List, oldIndex: number, newIndex: number}}){
    if (e.moved) {
        const list = $props.board().lists.find(e.moved.element.id)
        if (list != null) {
            $emit("transaction", new ListSortTransaction(list, e.moved.oldIndex, e.moved.newIndex))
        }
    }
}

</script>

<style scoped>
.board {
  display: inline-block;
  white-space: nowrap;
}

.board > div:not(:last-child) {
  /* Only the acctual lists but not the new-list "list" */
  display: inline-block;
  height: 100%;
}

.ghost-card {
  opacity: 0;
  transform: rotate(0) !important;
}

.drag-card {
  transform: rotate(-3deg) !important;
}
</style>
