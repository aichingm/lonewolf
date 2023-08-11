<template>
    <div style="height:100%;">
        <FileMenu v-model:show="fileMenu.state" @action="(action: string)=>fileMenu.actionHandler(action)"/>
        <div class="app-header-nav" :style="'border-bottom-color:' + borderColor + ';'">
            <n-space class="app-header-nav-space" justify="left" allign="center">
                <n-button @click="fileMenu.show(true)" :ghost ="true" :block="true" :bordered="false">
                    <template #icon>
                        <n-icon size="24" color="gray">
                            <icon icon="fluent:panel-left-expand-20-filled" />
                        </n-icon>
                    </template>
                </n-button>
                <TextInput fontSize="20px" :value="title.ref" @update:value="title.update" placeholder="Title" autosize commitOnBlur commitOnEnter selectOnEdit/>
                <n-tooltip v-if="!savedObserverExtension.isSavedRef().value" trigger="hover">
                    <template #trigger>
                        <n-icon size="24" :color="theme.warningColor" style="display:block;">
                            <icon icon="fluent:warning-20-filled" />
                        </n-icon>
                    </template>
                    The board has unsaved changes!
                </n-tooltip>
                <n-tooltip v-if="mostRecentExtension.failedRef().value" trigger="hover">
                    <template #trigger>
                        <n-icon size="24" :color="theme.errorColor" style="display:block;">
                            <icon icon="fluent:warning-20-filled" />
                        </n-icon>
                    </template>
                    The board is to large, in broswer storage disabled!
                </n-tooltip>
            </n-space>
            <n-space class="app-header-nav-space" justify="center">
                <div></div>
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
                        {{ toEmoji.get("tada") }}
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
                    @transaction="(t: Transaction)=>createTransactionHandler(boardFn())(t)"
                />
            </div>
            <CardDialog  v-if="cardDialogCard.card.id != ''"
                         :cardHolder="cardDialogCard"
                         :board="boardFn"
                         :labels="simpleDataRoot.board.labels"
                         v-model:show="cardDialogShow.ref"
                         @transaction="(t: Transaction)=>createTransactionHandler(boardFn())(t)" />
            <ListDialog v-if="listDialogList.list.id != ''"
                        :listHolder="listDialogList"
                        :board="boardFn"
                        v-model:show="listDialogShow.ref"
                        @transaction="(t: Transaction)=>createTransactionHandler(boardFn())(t)" />
            <SettingsDialog
                :board="boardFn"
                v-model:show="settingsDialogShow.ref"
                :cardArchive="simpleDataRoot.board.cardArchive"
                :listArchive="simpleDataRoot.board.listArchive"
                :lists="simpleDataRoot.board.lists"
                :labels="simpleDataRoot.board.labels"
                :settings="simpleDataRoot.board.settings"
                @transaction="(t: Transaction)=>createTransactionHandler(boardFn())(t)" />
            <AboutDialog v-model:show="aboutDialogShow.ref"/>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive, watch, shallowRef } from "vue";
import type { Ref } from "vue";
import { useThemeVars, useDialog } from 'naive-ui'

import BoardVue from "@/components/Board.vue";
import TextInput from "@/components/inputs/TextInput.vue";
import CardDialog from "@/components/CardDialog.vue";
import ListDialog from "@/components/ListDialog.vue";
import SettingsDialog from "@/components/SettingsDialog.vue";
import AboutDialog from "@/components/about/AboutDialog.vue";
import FileMenu from "@/components/FileMenu.vue";
import Board from "@/common/data/Board";
import type Card from "@/common/data/Card";
import type List from "@/common/data/List";
import MostRecent from "@/common/MostRecent";
import SavedObserver from "@/common/SavedObserver";
import { ExtensionManager } from "@/common/Extension";
import type { Transaction } from "@/common/data/Transaction";
import { RefProtector } from "@/utils/vue";
import { SDRoot, SDCardHolder, SDCard, SDListHolder, SDList } from "@/common/data/extern/SimpleData";
import { NewBoardTransaction, BoardChangeTransaction } from "@/common/data/transactions/BoardTransactions";
import { defaultAttachmentStorage } from "@/platform/Functions";
import { projectStorage, platformCanSupportBoard, platformExtensions } from "@/platform/Functions";

import toEmoji from "emoji-name-map";

const dialog = useDialog()

const theme  = useThemeVars();
const borderColor = theme.value.borderColor;

// Storage

const boardStorage = projectStorage();

// Transactions

function createTransactionHandler(board: Board) {
    return function transactionHandler(transaction: Transaction) {
        if (transaction.apply(board)) {
            transaction.mutate(simpleDataRoot.board, board)
            extensionManager.triggerOnTransaction(board, transaction)
        }
    }
}


// Extensions

const extensionManager = new ExtensionManager()
const savedObserverExtension = SavedObserver.getInstance()
savedObserverExtension.persist()
const mostRecentExtension = new MostRecent()

extensionManager.use(savedObserverExtension)
extensionManager.use(mostRecentExtension)

platformExtensions().forEach(e=>extensionManager.use(e))



// View Data

const fileMenu = {state: ref(false), show: (value: boolean)=>fileMenu.state.value=value, actionHandler: actionHandler}

const cardsStat = ref([0,0])


const cardDialogCard = reactive(new SDCardHolder(new SDCard("", "")))
const cardDialogShow =  new RefProtector(ref(false))

const listDialogList= reactive(new SDListHolder(new SDList("", "")))
const listDialogShow =  new RefProtector(ref(false))

const settingsDialogShow =  new RefProtector(ref(false))
const aboutDialogShow =  new RefProtector(ref(false))

const board = shallowRef(mostRecentExtension.exists() ? mostRecentExtension.load() as Board : newBoard()) as Ref<Board>; // as Board because typescript is stupid and can't see that .exist checks if it is null...

const title = new RefProtector(ref(""), (newTitle: string)=> {
    title.assign(newTitle);
    const t = new BoardChangeTransaction('name', title.ref.value)
    createTransactionHandler(board.value)(t)
})

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

const showListDialog = (_list: List, simpleList: SDList) => {
    listDialogShow.assign(true);
    listDialogList.list = simpleList;
}

function actionHandler(action: string) {

    const openNewBoard = () => {
        simpleDataRoot.reset()
        board.value = newBoard()
        simpleDataRoot.board = board.value.toSimpleData()
        extensionManager.triggerOnNew(board.value)
    }

    const openBoard = () => {
        boardStorage.load().then((b: Board)=>{
            if(!platformCanSupportBoard(b)){
                dialog.warning({
                    title: 'Unsupported project',
                    content: 'The opened project was created on a different platform, working on it would lead to data loss! Please open a different project to work on.',
                    positiveText: 'Ok',
                })
            } else {
                simpleDataRoot.reset()
                simpleDataRoot.board = b.toSimpleData()
                board.value = b
                extensionManager.triggerOnLoad(board.value)
            }

        })
    }
    switch (action) {
    case 'new':

        if (!savedObserverExtension.isSaved()) {
            dialog.warning({
                title: 'Unsaved changes',
                content: 'The currently open board is not saved, are you sure you want to open a new one? Unsaved changes will be lost!',
                positiveText: 'New Board',
                negativeText: 'Cancel',
                onPositiveClick: openNewBoard
            })
        } else {
            openNewBoard()
        }
        break;
    case 'save':
        //https://github.com/ankitrohatgi/tarballjs
        //https://github.com/Stuk/jszip
        //local boardStorage
        boardStorage.save(board.value).then(()=>{
            extensionManager.triggerOnSave(board.value)
        })
        break;
    case 'open':
        if (boardStorage.isListable()) {
            const _entries = boardStorage.list()
        } else if (!savedObserverExtension.isSaved()) {
            dialog.warning({
                title: 'Unsaved changes',
                content: 'The currently open board is not saved, are you sure you want to open a different one? Unsaved changes will be lost!',
                positiveText: 'Discard changes',
                negativeText: 'Cancel',
                onPositiveClick: openBoard
            })
        } else {
            openBoard()
        }
        break;
    case 'about':
        aboutDialogShow.assign(true)
        break;
    default:
        console.error("Unhandled action[" + action + "]")
        break;
    }

}


function newBoard () {
    const board = new Board(defaultAttachmentStorage())
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
    height: calc(100% - 10px);
}

:deep() .badge-reset .n-badge-sup {
    pointer-events: none;
}

</style>
