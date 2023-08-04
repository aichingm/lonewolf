<template>
    <div class="board">
        <draggable
            id="draggable"
            :class="'justify-content-' + listsJustification"
            :list="lists"
            group="lists"
            animation="200"
            ghostClass="ghost-card"
            dragClass="drag-list"
            item-key="id"
            handle=".list-dragger"
            @change="dragEvent"
            :force-fallback="(isChrome() /* this fixes that chrome includes the background of the element */ || isWebkit() /* this fixes webkit cliping the rotated element to the original shape*/)">

            >
            <template #item="{ element }">
                <ListVue
                    :board="$props.board"
                    :simpleBoard="$props.simpleBoard"
                    :simpleList="element"
                    :lists="lists"
                    :labels="$props.simpleBoard.labels"
                    @card-edit="(card, simpleCard)=>$emit('card-edit', card, simpleCard)"
                    @list-edit="(list, simpleList)=>$emit('list-edit', list, simpleList)"
                    @transaction="(t)=>$emit('transaction', t)"
                />
            </template>
            <template #footer>
                <NewList v-if="showNewList" @newList="newList" :size="listWidth"/>
            </template>
        </draggable>
    </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import draggable from "vuedraggable";


import ListVue from "./List.vue";
import NewList from "./NewList.vue";

import { NewListTransaction, ListSortTransaction } from "@/common/data/transactions/ListTransactions";
import { isChrome, isWebkit } from "@/utils/browser-comp";

import type Board from "@/common/data/Board";
import type { SDBoard } from "@/common/data/extern/SimpleData";
import type List from "@/common/data/List";

const $props = defineProps<{
    board: () => Board;
    simpleBoard: SDBoard;
}>();

const $emit = defineEmits(["transaction", "card-edit", "list-edit"]);

const lists = computed(()=>{$props.simpleBoard; $props.simpleBoard.version; return $props.simpleBoard.lists})

const listWidth = computed(()=>{$props.simpleBoard.settings.version; return $props.board().settings.boardListsWidth})

const showNewList = computed(()=>{$props.simpleBoard.settings.version; return $props.board().settings.boardShowNewList})

const listsJustification = computed(()=>{$props.simpleBoard.settings.version; return $props.board().settings.boardListsJustification})

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

#draggable{ /* if draggable is empty it still is focusable via tab, so hide it if it is empty*/
    min-width: 100%;
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    padding-left: 10px;
    padding-right: 10px;
    box-sizing: border-box;
}

.justify-content-center {
    justify-content: center;
}

.justify-content-space-evenly {
    justify-content: space-evenly;
}

.justify-content-left {
    justify-content: left;
}


#draggable:empty { /* if draggable is empty it still is focusable via tab, so hide it if it is empty*/
    display: none;
}

</style>
