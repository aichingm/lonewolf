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
        >
            <template #item="{ element }">
                <ListVue
                    :list="element"
                    :lists="lists"
                    @moveList="moveList"
                    @moveCardTo="moveCard"
                />
            </template>
        </draggable>
        <NewList @newList="newList" />
    </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import draggable from "vuedraggable";

import ListVue from "./List.vue";
import NewList from "./NewList.vue";

import type List from "@/common/List";
import type Board from "@/common/Board";
import type Card from "@/common/Card";

const $props = defineProps<{
    board: Board;
}>();

const lists = reactive($props.board.lists) as List[];

function moveCard(card: Card, oldList: List, newList: List) {
    oldList.removeCard(card);
    newList.insertCard(card, 0);
}

function moveList(oldPos: number, newPos: number) {
    $props.board.moveList(oldPos, newPos);
}
function newList(title: string) {
    $props.board.addList(title);
}
</script>

<style scoped>
.board {
  overflow-x: scroll;
  overflow-y: hidden;
  white-space: nowrap;
  height: 100%;
  width: 100%;
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
