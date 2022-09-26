<template>
    <div class="wrapper">
        <BoardVue :board="board" class="board"/>
    </div>
</template>

<script setup lang="ts">
import { v1 as uuid1 } from "uuid";
import { reactive } from "vue";

import BoardVue from "@/components/Board.vue";

import Board from "@/common/Board";

const board = reactive(new Board(uuid1(), "Default")) as Board;
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
