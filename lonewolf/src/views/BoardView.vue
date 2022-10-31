<template>
    <div class="wrapper">
        <BoardVue
            :board="board"
            class="board"
        />
    </div>
</template>

<script setup lang="ts">
import { v1 as uuid } from "uuid";

import BoardVue from "@/components/Board.vue";
import Board from "@/common/data/Board";

const board = new Board(uuid(), "Default");

</script>

<style scoped>
.wrapper {
  height: 100%;
  display: block;
  overflow-x: scroll;
  overflow-y: hidden;

}

.board{
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
  height: calc(100% - 10px);
}

</style>
