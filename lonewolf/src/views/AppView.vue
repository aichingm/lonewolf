<template>
    <div style="height:100%;">
        <FileMenu v-model:show="fileMenu.state" @action="(action: string)=>fileMenu.actionHandler(action)"/>
        <div class="app-header-nav" :style="'border-bottom-color:' + borderColor + ';'">
            <n-space class="app-header-nav-space" justify="space-between">
                <n-button @click="fileMenu.show(true)" :ghost ="true" :block="true" :bordered="false">
                    <template #icon>
                        <n-icon size="24" color="gray">
                            <icon icon="fluent:panel-left-expand-20-filled" />
                        </n-icon>
                    </template>
                </n-button>
                <n-input v-model:value="searchValue" type="text" placeholder="Search" clearable>
                    <template #prefix>
                        <n-icon color="gray">
                            <icon icon="fluent:search-20-filled" />
                        </n-icon>
                    </template>
                </n-input>
                <n-button quaternary circle style="margin-right: 8px">
                    <template #icon>
                        <n-icon size="18" color="gray">
                            <icon icon="fluent:more-vertical-20-filled" />
                        </n-icon>
                    </template>
                </n-button>
            </n-space>
        </div>
        <div class="app-config-wrapper">
            <div class="wrapper">
                <BoardVue
                    :data="transactionTreeRoot.nodes[0]"
                    :board="boardFn"
                    class="board"
                    @card-edit="showCardDialog"
                    @list-edit="showListDialog"
                    @transaction="transactionHandler"
                />
            </div>
            <CardDialog :id="cardDialog.id" :board="boardFn" v-model:show="cardDialog.show" @transaction="transactionHandler" />
            <ListDialog :id="listDialog.id" :board="boardFn" v-model:show="listDialog.show" @transaction="transactionHandler" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive } from "vue";
import { useThemeVars } from 'naive-ui'
import { v4 as uuid } from "uuid";


import BoardVue from "@/components/Board.vue";
import CardDialog from "@/components/CardDialog.vue";
import ListDialog from "@/components/ListDialog.vue";
import FileMenu from "@/components/FileMenu.vue";
import Board from "@/common/data/Board";
import type Card from "@/common/data/Card";
import type List from "@/common/data/List";
import type Transaction from "@/common/data/Transaction";
import  { TransactionTree, NewCardTransaction, NewListTransaction, NewBoardTransaction } from "@/common/data/Transaction";


const theme  = useThemeVars();
const borderColor = theme.value.borderColor;

const fileMenu = {state: ref(false), show: (value: boolean)=>fileMenu.state.value=value, actionHandler: actionHandler}

const searchValue = ref();
const cardDialog = {show: ref(false), id: ref("")};
const listDialog = {show: ref(false), id: ref("")};


let board = new Board()
new NewBoardTransaction().apply(board)
new NewListTransaction("Open").apply(board)
new NewListTransaction("Closed").apply(board)
new NewCardTransaction(board.lists.items[0].id, "My First Issue").apply(board)
new NewCardTransaction(board.lists.items[0].id, "A Simple Task").apply(board)
new NewCardTransaction(board.lists.items[1].id, "Create This Card").apply(board)

const boardFn = () => board;

const transactionTreeRoot = reactive(new TransactionTree("root-node", "no-transaction-id"))
transactionTreeRoot.nodes.push(board.toTransactionTree())

const showCardDialog = (card: Card) => {cardDialog.show.value = true; cardDialog.id.value = card.id;}
const showListDialog = (list: List) => {listDialog.show.value = true; listDialog.id.value = list.id;}

function transactionHandler(transaction: Transaction) {
    if (transaction.apply(board)) {
        transaction.mutateTransactionTree(transactionTreeRoot.nodes[0], board)
        board.transactions.push(transaction)
    }
}

function actionHandler(action: string) {

    switch (action) {
    case 'new':

        // TODO here should be a check if the board is saved

        transactionTreeRoot.lastTransactionId = uuid()
        transactionTreeRoot.nodes.splice(0, transactionTreeRoot.nodes.length)

        board = new Board()
        new NewBoardTransaction().apply(board)
        transactionTreeRoot.nodes.push(board.toTransactionTree())
        break;
    default:
        console.error("Unhandled action[" + action + "]")
        break;
    }

}


</script>
<style scoped>
.app-config-wrapper{
    height: calc(100% - 48px);
}
.app-header-nav{
    height: 47px;
    border-bottom: solid 1px;
}
.app-header-nav-space{
    height: 48px;
    align-items: center;
}
.app-board{
    height: calc(100% - 48px);
}

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
