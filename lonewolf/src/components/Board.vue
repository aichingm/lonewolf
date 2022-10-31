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
                    :list="element"
                />
            </template>
        </draggable>
        <NewList @newList="newList" />
    </div>
</template>

<script setup lang="ts">
import { shallowRef, watch } from "vue";
import draggable from "vuedraggable";


import ListVue from "./List.vue";
import NewList from "./NewList.vue";

import { NewListTransaction, ListSortTransaction } from "@/common/data/Transaction";
import type Board from "@/common/data/Board";

import type List from "@/common/data/List";

const $props = defineProps<{
    board: Board;
}>();

const lists = shallowRef($props.board.lists.toArray());

watch($props.board.vueTicker(), () => {
    lists.value = $props.board.lists.toArray();
})

function newList(title: string) {
    $props.board.execTransaction(new NewListTransaction($props.board, title))
}

function dragEvent(e: {moved: {element: List, oldIndex: number, newIndex: number}}){
    if (e.moved) {
        const list = $props.board.lists.find(e.moved.element.id)
        if (list != null) {
            $props.board.execTransaction(new ListSortTransaction(list, e.moved.oldIndex, e.moved.newIndex))
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
