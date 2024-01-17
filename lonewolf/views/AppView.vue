<template>
    <div class="full-height">
        <KeymapEmitter :appSettings="$props.appSettings" :target="$window" :actions="['save', 'save-as', 'new', 'open']" @action="actionHandler"/>
        <FileMenu v-model:show="fileMenu.state" @action="(action: string)=>fileMenu.actionHandler(action)"/>
        <div class="app-header-nav">
            <div class="app-header-nav-start">
                <div>
                    <n-button id="file-menu-opener" @click="fileMenu.show(true)" :ghost ="true" :block="true" :bordered="false">
                        <template #icon>
                            <n-icon size="24" color="gray">
                                <icon icon="fluent:panel-left-expand-20-filled" />
                            </n-icon>
                        </template>
                    </n-button>
                </div>
                <TextInput style="overflow-x:auto;margin-left:-12px;" fontSize="20px" :value="title.ref" @update:value="title.update" placeholder="Title" autosize commitOnBlur commitOnEnter selectOnEdit/>
                <n-tooltip v-if="!savedObserverExtension.isSavedRef().value" trigger="hover">
                    <template #trigger>
                        <n-icon size="24" :color="theme.warningColor" class="block">
                            <icon icon="fluent:warning-20-filled" />
                        </n-icon>
                    </template>
                    The board has unsaved changes!
                </n-tooltip>
                <n-tooltip v-if="mostRecentExtension.failedRef().value" trigger="hover">
                    <template #trigger>
                        <n-icon size="24" :color="theme.errorColor" class="block">
                            <icon icon="fluent:warning-20-filled" />
                        </n-icon>
                    </template>
                    The board is to large, in browser storage disabled!
                </n-tooltip>
            </div>
            <div class="app-header-nav-end">
                <n-tooltip trigger="hover">
                    <template #trigger>
                        <n-badge class="badge-reset" :value="cardsStat[0]" :color="theme.headerBadgeColor" :max="99">
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
                <n-button quaternary circle class="settings-button" @click="settingsDialogShow.assign(true)">
                    <template #icon>
                        <n-icon size="18" color="gray">
                            <icon icon="fluent:more-vertical-20-filled" />
                        </n-icon>
                    </template>
                </n-button>
            </div>
        </div>
        <div class="app-config-wrapper">
            <TransactionEmitter :type="'BoardTransaction'" @transaction="(t)=>boardTransactionHandler(t)">
                <div class="wrapper" >
                    <BoardComponent
                        :project="projectRef"
                        :board="boardObservableRef"
                        :appSettings="$props.appSettings"
                        class="board"
                        @card-edit="showCardDialog"
                        @list-edit="showListDialog"
                        :preferences="preferencesRef"
                    />
                </div>
                <CardDialog  v-if="cardDialogCard.id != ''"
                             v-model:show="cardDialogShow.ref"
                             :project="projectRef"
                             :board="boardObservableRef"
                             :cardObservable="cardDialogCard"
                             :appSettings="$props.appSettings"
                />
                <ListDialog v-if="listDialogList.id != ''"
                            v-model:show="listDialogShow.ref"
                            :project="projectRef"
                            :board="boardObservableRef"
                            :listObservable="listDialogList"
                />
                <TransactionEmitter type="PreferencesTransaction" @transaction="(t)=>preferencesTransactionHandler(t)">
                    <SettingsDialog
                        v-model:show="settingsDialogShow.ref"
                        :project="projectRef"
                        :board="boardObservableRef"
                        :preferences="preferencesRef"
                        :appSettings="$props.appSettings"
                    />
                </TransactionEmitter>
            </TransactionEmitter>
            <AboutDialog v-model:show="aboutDialogShow.ref"/>
        </div>
    </div>
    <PlatformComponent @loadBoard="b => openBoard(b)"/>
</template>
<script setup lang="ts">
import { ref, watch, shallowRef } from "vue";
import { useThemeVars, useDialog} from 'naive-ui'
import { themeCast } from '@/themes/theme'

import BoardComponent from "@/components/Board.vue";
import TextInput from "@/components/inputs/TextInput.vue";
import CardDialog from "@/components/CardDialog.vue";
import ListDialog from "@/components/ListDialog.vue";
import SettingsDialog from "@/components/SettingsDialog.vue";
import AboutDialog from "@/components/about/AboutDialog.vue";
import FileMenu from "@/components/FileMenu.vue";
import TransactionEmitter from "@/components/transactions/Emitter.vue";

import Board from "@/common/data/Board";
import Project from "@/common/Project";

import type Card from "@/common/data/Card";
import type List from "@/common/data/List";

import SavedObserver from "@/common/extensions/SavedObserver";
import MostRecent from "@/common/extensions/MostRecent";
import PreferencesExt from "@/common/extensions/Preferences";

import { ExtensionManager } from "@/common/Extension";
import type { BoardTransaction, PreferencesTransaction } from "@/common/transactions/Transaction";
import { RefProtector } from "@/utils/vue";
import { Card as CardObservable, List as ListObservable } from "@/common/Observable";
import { NewBoardTransaction, BoardChangeTransaction } from "@/common/transactions/BoardTransactions";
import { defaultAttachmentStorage } from "@/platform/Functions";
import { projectStorage as boardStorage, platformCanSupportBoard, platformExtensions } from "@/platform/Functions";
import PlatformComponent from "@/platform/PlatformComponent.vue";

import type ApplicationSettings from '@/common/settings/AppSettings'

import KeymapEmitter from '@/components/KeymapEmitter.vue'

import toEmoji from "emoji-name-map";

const $props = defineProps<{
    appSettings: ApplicationSettings
}>()

const dialog = useDialog()

const theme = themeCast(useThemeVars());

const $window = window


// Storage


// Transactions

const boardTransactionHandler = (transaction: BoardTransaction) => {
    if (transaction.apply(project.board)) {
        transaction.mutate(boardObservableRef.value, project.board)
        extensionManager.triggerOnTransaction(project, transaction)
    }
}

const preferencesTransactionHandler = (transaction: PreferencesTransaction) => {
    if(transaction.apply(preferencesExt.ref.value)){
        transaction.mutate(preferencesRef.value)
        extensionManager.triggerOnPreferencesTransaction(project, transaction)
    }
}

// Extensions

const extensionManager = new ExtensionManager()
const savedObserverExtension = SavedObserver.getInstance()
savedObserverExtension.persist()
const mostRecentExtension = new MostRecent()
const preferencesExt = new PreferencesExt()

extensionManager.use(savedObserverExtension)
extensionManager.use(mostRecentExtension)
extensionManager.use(preferencesExt)

platformExtensions().forEach(e=>extensionManager.use(e))


// Data

const project = new Project(newBoard())
const projectRef = shallowRef(project)
const preferencesRef = preferencesExt.ref
const boardObservableRef = ref(project.board.observable())


// extensionManager.triggerOnLoad(project) DO NOT trigger load here or else most recent will save the new board and then load the new board

mostRecentExtension.load().then((board)=> {
    project.board = board
    boardObservableRef.value = board.observable()
    extensionManager.triggerOnLoad(project)
}).catch(()=>{return})

// View Data

const fileMenu = {state: ref(false), show: (value: boolean)=>fileMenu.state.value=value, actionHandler: actionHandler}

const cardsStat = ref([0,0])


const cardDialogCard = ref(new CardObservable("", ""))
const cardDialogShow =  new RefProtector(ref(false))

const listDialogList= ref(new ListObservable("", ""))
const listDialogShow =  new RefProtector(ref(false))

const settingsDialogShow =  new RefProtector(ref(false))

const aboutDialogShow =  new RefProtector(ref(false))



const title = new RefProtector(ref(""), (newTitle: string)=> {
    title.assign(newTitle);
    const t = new BoardChangeTransaction('name', title.ref.value)
    boardTransactionHandler(t)
})

title.assign(project.board.name)
cardsStat.value = project.board.cardOpenClosedStatistic()


const watchCurrentBoard = ()=>watch(boardObservableRef.value, ()=>cardsStat.value = project.board.cardOpenClosedStatistic())
watchCurrentBoard()

// This gets triggered if the board changes (new, open, ...)
watch(boardObservableRef, ()=>{
    title.assign(project.board.name)
    cardsStat.value = project.board.cardOpenClosedStatistic()
    watchCurrentBoard() // reinit for changes in board and not only for the ref
})

const showCardDialog = (_card: Card, card: CardObservable) => {
    cardDialogShow.assign(true);
    cardDialogCard.value = card
}

const showListDialog = (_list: List, list: ListObservable) => {
    listDialogShow.assign(true);
    listDialogList.value = list;
}

function openBoard (board: Board) {
    if(!platformCanSupportBoard(board)){
        dialog.warning({
            title: 'Unsupported project',
            content: 'The opened project was created on a different platform, working on it would lead to data loss! Please open a different project to work on.',
            positiveText: 'Ok',
        })
    } else {
        boardObservableRef.value = board.observable()
        project.board = board
        extensionManager.triggerOnLoad(project)
    }
}

function openNewBoard () {
    openBoard(newBoard())
}

function newBoard () {
    const board = new Board(defaultAttachmentStorage())
    board.name = "Untitled Board"
    new NewBoardTransaction().apply(board)
    return board
}

function actionHandler(action: string) {

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
        boardStorage().save(project.board).then(()=>{
            extensionManager.triggerOnSave(project)
        })
        break;
    case 'save-as':
        boardStorage().saveAs(project.board).then((uuid: string)=>{
            boardTransactionHandler(new BoardChangeTransaction("id", uuid))
            extensionManager.triggerOnSaveAs(project)
        })
        break;
    case 'open':
        if (boardStorage().isListable()) {
            const _entries = boardStorage().list()
        } else if (!savedObserverExtension.isSaved()) {
            dialog.warning({
                title: 'Unsaved changes',
                content: 'The currently open board is not saved, are you sure you want to open a different one? Unsaved changes will be lost!',
                positiveText: 'Discard changes',
                negativeText: 'Cancel',
                onPositiveClick: ()=>boardStorage().load().then((board: Board)=>{openBoard(board)})
            })
        } else {
            boardStorage().load().then((board: Board)=>{openBoard(board)})
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

</script>
<style scoped>

.full-height {
    height: 100%;
}

.block {
    display: block;
}

.settings-button {
    margin-right: 8px;
}

.app-config-wrapper{
    height: calc(100% - 48px);
}

.app-header-nav{
    height: 47px;
    display: flex;
    border-bottom: solid 1px v-bind('theme.borderColor');
    background-color: v-bind('theme.cardColor');
    justify-content: space-between;
}

.app-header-nav-space{
    height: 48px;
}

.app-header-nav-start{
    display: flex;
    align-items: center;
    max-width: calc(100% - 80px);
    gap: 0px 8px;

}

.app-header-nav-end{
    display: flex;
    align-items: center;
    gap: 0px 8px;
}

.app-board{
    height: calc(100% - 48px);
    background-color: v.bind('theme.bodyColor')
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
