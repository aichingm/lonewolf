<template>
    <!--<n-button @click="save">Save</n-button> {{ board.name }}
    <n-button @click="load">Load</n-button>-->
    <div class="wrapper">
        <BoardVue
            :data="tt.nodes[0]"
            :board="boardFn"
            class="board"
            @card-edit="cardDialog"
            @list-edit="listDialog"
            @transaction="transactionHandler"
        />
    </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { reactive } from 'vue'

import BoardVue from "@/components/Board.vue";
import Board from "@/common/data/Board";
import type Card from "@/common/data/Card";
import type List from "@/common/data/List";
import  { TransactionTree } from "@/common/data/Transaction";
import type Transaction from "@/common/data/Transaction";

const board = new Board()
const boardFn = () => board;
const tt = reactive(new TransactionTree("root-node", "no-transaction-id"))
tt.nodes.push(board.toTransactionTree())

const router = useRouter();
const route = useRoute();

const cardDialog = (card: Card) => router.push({path: "/board/" + route.params.board + "/card/" + card.id})
const listDialog = (list: List) => router.push({path: "/board/" + route.params.board + "/list/" + list.id})


function transactionHandler(transaction: Transaction) {
    if (transaction.apply(board)) {
        transaction.mutateTransactionTree(tt.nodes[0], board)
        board.transactions.push(transaction)
    }
}
/*
const storage = null;
function save(){
    storage = JSON.stringify(board.toSerializable())
    console.log("store", storage)
}

function load(){
    board = Board.fromSerializable(JSON.parse(storage))
    //tt.nodes.splice(0)
    tt.nodes = new Array<TransactionTree>()
    tt.nodes.push(board.toTransactionTree())
    console.log("load", storage, tt)
}*/

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
