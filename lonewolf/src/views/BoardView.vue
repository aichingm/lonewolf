<template>
    <div class="wrapper">
        <BoardVue :board="board" />
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
  width: 100%;
  display: block;
}
</style>
