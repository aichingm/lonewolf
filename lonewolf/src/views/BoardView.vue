<template>
    <div class="wrapper">
        <BoardVue
            :board="board"
            class="board"
            @card-edit="cardDialog"
            @list-edit="listDialog"
        />
    </div>
</template>

<script setup lang="ts">
import { v1 as uuid } from "uuid";
import { useRouter, useRoute } from 'vue-router'

import BoardVue from "@/components/Board.vue";
import Board from "@/common/data/Board";
import type Card from "@/common/data/Card";
import type List from "@/common/data/List";

const board = new Board(uuid(), "Default");

const router = useRouter();
const route = useRoute();

const cardDialog = (card: Card) => router.push({path: "/board/" + route.params.board + "/card/" + card.id})
const listDialog = (list: List) => router.push({path: "/board/" + route.params.board + "/list/" + list.id})

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
