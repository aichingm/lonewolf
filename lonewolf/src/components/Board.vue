<template>
    <div class="board">
        <draggable
            id="draggable"
            :list="lists"
            group="lists"
            animation="200"
            ghostClass="ghost-card"
            dragClass="drag-list"
            item-key="id"
            handle=".list-dragger"
            @change="dragEvent"
            :force-fallback="isChrome()"
        >
            <template #item="{ element }">
                <ListVue
                    :board="$props.board"
                    :data="element"
                    :lists="lists"
                    @card-edit="(card)=>$emit('card-edit', card)"
                    @list-edit="(list)=>$emit('list-edit', list)"
                    @transaction="(t)=>$emit('transaction', t)"
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
import { isChrome } from "@/utils/browser-comp";

import type Board from "@/common/data/Board";
import type List from "@/common/data/List";

const $props = defineProps<{
    board: () => Board;
    data: TransactionTree;
}>();

const $emit = defineEmits(["transaction", "card-edit", "list-edit"]);
const lists = computed(()=>{$props.data;$props.data.version; return $props.data.nodes})

function newList(title: string) {
    $emit("transaction", new NewListTransaction(title))
}

function dragEvent(e: {moved: {element: List, oldIndex: number, newIndex: number}}){
    if (e.moved) {
        const list = $props.board().findList(e.moved.element.id)
        if (list != null) { // TODO why can this be null, add comment
            $emit("transaction", new ListSortTransaction(list.id, e.moved.oldIndex, e.moved.newIndex).preventMutation())
        }
    }
    return false
}

</script>

<style >
.board {
  display: inline-block;
  white-space: nowrap;
}

.board > div:not(:last-child) {
  /* Only the acctual lists but not the new-list "list" */
  display: inline-block;
  height: 100%;
}

.ghost-card{
  opacity: 0;
  transform: rotate(0) !important;
}

.drag-list {
  rotate: -3deg;
}

#draggable:empty { /* if drafable is empty it still is focusable via tab, so hide it if it is empty*/
    display: none;
}

</style>
