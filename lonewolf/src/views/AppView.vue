<template>
    <div style="height:100%;">
        <FileMenu v-model:show="fileMenu.state" @action="(action: string)=>fileMenu.actionHandler(action)"/>
        <div class="app-header-nav" :style="'border-bottom-color:' + borderColor + ';'">
            <n-space class="app-header-nav-space" justify="left">
                <n-button @click="fileMenu.show(true)" :ghost ="true" :block="true" :bordered="false">
                    <template #icon>
                        <n-icon size="24" color="gray">
                            <icon icon="fluent:panel-left-expand-20-filled" />
                        </n-icon>
                    </template>
                </n-button>
                <TextInput fontSize="20px" :value="title.ref" @update:value="title.update" placeholder="Title" autosize commitOnBlur commitOnEnter selectOnEdit/>
            </n-space>
            <n-space class="app-header-nav-space" justify="center">
                <n-input v-model:value="searchValue" type="text" placeholder="Search" clearable>
                    <template #prefix>
                        <n-icon color="gray">
                            <icon icon="fluent:search-20-filled" />
                        </n-icon>
                    </template>
                </n-input>
            </n-space>
            <n-space class="app-header-nav-space" justify="right">
                <n-tooltip trigger="hover">
                    <template #trigger>
                        <n-badge class="badge-reset" :value="cardsStat[0]" color="#d0d0d0" :max="99">
                        </n-badge>
                    </template>
                    {{ cardsStat[0] }} cards of {{ cardsStat[0] + cardsStat[1] }} are open, {{ cardsStat[1] }} are closed
                </n-tooltip>
                <n-tooltip v-if="cardsStat[0]==0" trigger="hover">
                    <template #trigger>
                        {{ emo("tada") }}
                    </template>
                    All done, take a break!
                </n-tooltip>
                <n-button quaternary circle style="margin-right: 8px" @click="settingsDialogShow.assign(true)">
                    <template #icon>
                        <n-icon size="18" color="gray">
                            <icon icon="fluent:more-vertical-20-filled" />
                        </n-icon>
                    </template>
                </n-button>
            </n-space>
        </div>
        <div class="app-config-wrapper">
            <div class="wrapper" >
                <BoardVue
                    :simpleBoard="simpleDataRoot.board"
                    :board="boardFn"
                    class="board"
                    @card-edit="showCardDialog"
                    @list-edit="showListDialog"
                    @transaction="(t)=>createTransactionHandler(boardFn())(t)"
                />
            </div>
            <CardDialog  v-if="cardDialogCard.card.id != ''" :cardHolder="cardDialogCard" :board="boardFn" :labels="simpleDataRoot.board.labels" v-model:show="cardDialogShow.ref" @transaction="(t)=>createTransactionHandler(boardFn())(t)" />
            <ListDialog :id="listDialog.id" :board="boardFn" v-model:show="listDialog.show" @transaction="(t)=>createTransactionHandler(boardFn())(t)" />
            <SettingsDialog :board="boardFn" v-model:show="settingsDialogShow.ref" :labels="simpleDataRoot.board.labels" :settings="simpleDataRoot.board.settings" @transaction="(t)=>createTransactionHandler(boardFn())(t)" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive, watch, shallowRef } from "vue";
import type { Ref } from "vue";
import { useThemeVars } from 'naive-ui'
import BoardVue from "@/components/Board.vue";
import TextInput from "@/components/inputs/TextInput.vue";
import CardDialog from "@/components/CardDialog.vue";
import ListDialog from "@/components/ListDialog.vue";
import SettingsDialog from "@/components/SettingsDialog.vue";
import FileMenu from "@/components/FileMenu.vue";
import Board from "@/common/data/Board";
import type Card from "@/common/data/Card";
import type List from "@/common/data/List";
import MostRecent from "@/common/MostRecent";
import type { Transaction } from "@/common/data/Transaction";
import { RefProtector } from "@/utils/vue";
import { SDRoot, SDCardHolder, SDCard } from "@/common/data/extern/SimpleData";
import  { NewBoardTransaction, BoardChangeTransaction } from "@/common/data/transactions/BoardTransactions";
import  { BrowserNativeStorage } from "@/common/storage/BrowserStorage";

import toEmoji from "emoji-name-map";

const emo = (name: string): string => toEmoji.get(name)

const theme  = useThemeVars();
const borderColor = theme.value.borderColor;

const fileMenu = {state: ref(false), show: (value: boolean)=>fileMenu.state.value=value, actionHandler: actionHandler}

const searchValue = ref();
const cardsStat = ref([0,0])

const cardDialogCard = reactive(new SDCardHolder(new SDCard("", "")))
const cardDialogShow =  new RefProtector(ref(false))

const settingsDialogShow =  new RefProtector(ref(false))

const listDialog = {show: ref(false), id: ref("")};

const title = new RefProtector(ref(""), (newTitle: string)=> {
    title.assign(newTitle);
    const t = new BoardChangeTransaction('name', title.ref.value)
    createTransactionHandler(board.value)(t)
})


const board = shallowRef(MostRecent.exists() ? MostRecent.load() as Board : newBoard()) as Ref<Board>; // as Board because typescript is stupid and can't see that .exist checks if it is null...


title.assign(board.value.name)
cardsStat.value = board.value.cardOpenClosedStatistic()

watch(board, ()=>{
    title.assign(board.value.name)
    cardsStat.value = board.value.cardOpenClosedStatistic()
})

const boardFn = (): Board => board.value;

const simpleDataRoot = reactive(new SDRoot("root-node", "no-transaction-id", board.value.toSimpleData()))

// we need simpleDataRoot here in case a new board gets loaded
watch([simpleDataRoot, simpleDataRoot.board.lists], ()=>{cardsStat.value = board.value.cardOpenClosedStatistic()})

const showCardDialog = (_card: Card, simpleCard: SDCard) => {
    cardDialogShow.assign(true);
    cardDialogCard.card = simpleCard;
}
const showListDialog = (list: List) => {listDialog.show.value = true; listDialog.id.value = list.id;}

function createTransactionHandler(board: Board) {
    return function transactionHandler(transaction: Transaction) {
        if (transaction.apply(board)) {
            transaction.mutate(simpleDataRoot.board, board)
            board.transactions.push(transaction)
            MostRecent.put(board)
        }
    }
}

const storage = new BrowserNativeStorage();

function actionHandler(action: string) {

    switch (action) {
    case 'new':

        // TODO here should be a check if the board is saved

        simpleDataRoot.reset()

        board.value = newBoard()

        simpleDataRoot.board = board.value.toSimpleData()
        break;

    case 'save':
        //https://github.com/ankitrohatgi/tarballjs
        //https://github.com/Stuk/jszip
        //local storage
        storage.save(board.value)
        break;
    case 'open':
        if (storage.isListable()) {
            const _entries = storage.list()
        } else {
            storage.load("").then((b: Board)=>{
                simpleDataRoot.reset()
                simpleDataRoot.board = b.toSimpleData()
                board.value = b
            })
        }
        break;
    default:
        console.error("Unhandled action[" + action + "]")
        break;
    }

}


function newBoard () {
    const board = new Board()
    board.name = "Untitled Board"
    new NewBoardTransaction().apply(board)
    return board
}



</script>
<style scoped>
.app-config-wrapper{
    height: calc(100% - 48px);
}

.app-header-nav{
    height: 47px;
    border-bottom: solid 1px;
    display: flex;
}

.app-header-nav-space{
    height: 48px;
    align-items: center;
    width: calc( 100% / 3);
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
    display: flex;
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px;
    height: calc(100% - 10px);
}

:deep() .badge-reset .n-badge-sup {
    pointer-events: none;
}

</style>
