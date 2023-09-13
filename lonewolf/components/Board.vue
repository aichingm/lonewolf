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
                    :project="$props.project"
                    :board="$props.board"
                    :preferences="$props.preferences"
                    :list="element"
                    @card-edit="(card, cardObserver)=>$emit('card-edit', card, cardObserver)"
                    @list-edit="(list, listObserver)=>$emit('list-edit', list, listObserver)"
                />
            </template>
            <template #footer>
                <NewList v-if="showNewList" @newList="newList" :style="listWidth"/>
            </template>
        </draggable>
    </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import draggable from "vuedraggable";

import ListVue from "./List.vue";
import NewList from "./NewList.vue";

import { useTransactions } from '@/components/transactions/api'
import { NewListTransaction, ListSortTransaction } from "@/common/transactions/ListTransactions";

import { isChrome, isWebkit } from "@/utils/browser-comp";

import type Project from "@/common/Project";
import type { Board as BoardObservalbe } from "@/common/Observable";
import type List from "@/common/data/List";
import type Preferences from "@/common/settings/Preferences"

const $props = defineProps<{
    project: Project;
    board: BoardObservalbe;
    preferences: Preferences;
}>();

const $emit = defineEmits(["card-edit", "list-edit"]);

const transactions = useTransactions()

const lists = computed(()=>{$props.board; $props.board.version; return $props.board.lists})

const showNewList = computed(()=>{$props.board.settings.version; return $props.project.board.settings.boardShowNewList})

const listsJustification = computed(()=>$props.preferences.boardListsJustification)

const listWidth = computed(()=>$props.preferences.boardListsJustification == "equal"?'flex-grow: 1;':('width:' + $props.preferences.boardListsWidth + 'px;'))

function newList(title: string) {
    transactions.commit(new NewListTransaction(title))
}

function dragEvent(e: {moved: {element: List, oldIndex: number, newIndex: number}}){
    if (e.moved) {
        const list = $props.project.board.findList(e.moved.element.id)
        if (list != null) { // TODO why can this be null, add comment
            transactions.commit(new ListSortTransaction(list.id, e.moved.oldIndex, e.moved.newIndex).preventMutation())
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

.justify-content-equal {
}


#draggable:empty { /* if draggable is empty it still is focusable via tab, so hide it if it is empty*/
    display: none;
}

</style>
