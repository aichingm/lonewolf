<template>
    <div
        class="list-lane"
        :style="listWidth"
    >
        <div
            class="list-header list-part list-dragger"
            @click="$emit('list-edit', data.list, $props.list)"
        >
            <div class="list-name">
                {{ data.list.name }}
            </div>
            <n-space
                :size="7"
                align="center"
                gap="0"
                @click.stop
            >
                <n-badge
                    :value="data.cards.length + (data?.list.enableCardLimit? ('/' + data?.list.actualCardLimit()) : '')"
                    show-zero
                    :color="data?.list.enableCardLimit && !data?.list.canAcceptCard() ? undefined : theme.listBadgeColor"
                    :type="data?.list.enableCardLimit && !data?.list.canAcceptCard() ? 'error' : 'default'"
                />
                <ActionDropdown
                    :options="data.actions"
                    @selected="actionMenuSelected"
                />
            </n-space>
        </div>
        <div :class="'cards list-part ' + (inputHasFocus?'':'list-dragger')">
            <!-- eslint-disable vue/no-mutating-props -->
            <draggable
                :data-id="$props.list.id"
                :list="$props.list.cards"
                group="cards"
                animation="200"
                item-key="id"
                ghost-class="ghost-card"
                drag-class="drag-card"
                :move="checkDrag"
                :force-fallback="(isChrome() /* this fixes that chrome includes the background of the element */ || isWebkit() /* this fixes webkit cliping the rotated element to the original shape*/)"
                @change="dragEvent($event)"
            >
                <!-- eslint-enable -->
                <template #item="{ element }">
                    <CardVue
                        :project="$props.project"
                        :card="element"
                        :data-id="element.id"
                        :board="$props.board"
                        @card-edit="(card, simpleCard)=>$emit('card-edit', card, simpleCard)"
                    />
                </template>
            </draggable>
            <n-input-group>
                <n-input
                    :id="cardTitleInputId"
                    v-model:value="cardTitle"
                    placeholder="New Card"
                    :theme-overrides="inputThemeOverrides"
                    :disabled="!data?.list.canAcceptCard()"
                    @keyup.enter="newCardButtonClicked()"
                    @focus="inputHasFocus = true"
                    @blur="inputHasFocus = false"
                />
                <n-button
                    type="primary"
                    tabindex="-1"
                    :disabled="!data?.list.canAcceptCard()"
                    @click="newCardButtonClicked()"
                >
                    +
                </n-button>
            </n-input-group>
            <div :id="scrollTargetId" />
        </div>
        <div class="list-footer list-part list-dragger" />
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";

import { useThemeVars, useDialog } from 'naive-ui'

import draggable from "vuedraggable";
import { v1 as uuid1 } from "uuid";

import CardVue from "./Card.vue";
import ActionDropdown from "./ActionDropdown.vue";
import type { DropdownOption } from "./DropdownOption";
import { staticOption, groupOption } from "./DropdownOption";
import { isChrome, isWebkit } from "@/utils/browser-comp";

import type Project from "@/common/Project";
import type List from "@/common/data/List";
import type Card from "@/common/data/Card";
import type Preferences from "@/common/settings/Preferences";

import type { List as ListObservable, Board as BoardObservable, Card as CardObservable} from "@/common/Observable";

import { useTransactions } from '@/components/transactions/api'
import { ListDeleteTransaction, ListSortTransaction, ListArchiveTransaction } from "@/common/transactions/ListTransactions";
import { NewCardTransaction, CardSortTransaction, CardMoveTransaction } from "@/common/transactions/CardTransactions";

import { themeCast } from '@/themes/theme'

const $props = defineProps<{
    project: Project;
    board: BoardObservable;
    preferences: Preferences;
    list: ListObservable;
}>();

const $emit = defineEmits(["card-edit", "list-edit"]);

const theme = themeCast(useThemeVars())

const transactions = useTransactions()

const  dialog = useDialog()

const data = computed(()=> {
    const list = $props.project.board.findList($props.list.id) as List

    const cards = $props.list.cards

    const lists = $props.board.lists.map((t: ListObservable) : List|null => $props.project.board.findList(t.id)).filter(l=>l!=null) as List[]

    const actions = generateActions(cards, list, lists)

    return {
        list: list,
        cards: cards,
        lists: lists,
        actions: actions,
        version: $props.list.version, // this triggers the recomputation in case of a change in the list
    }
})


const listWidth = computed(()=>$props.preferences.boardListsJustification == "equal"?'flex-grow: 1;':('width:' + $props.preferences.boardListsWidth + 'px;'))


function generateActions(cards: CardObservable[], list: List, lists: List[]): DropdownOption[] {
    const children = filterMoveList(list, lists);
    return [
        staticOption("edit", "editKey", "Edit", list),
        groupOption("move", "moveKey", "Move", list, children, children?.length == 0),
        staticOption("archive", "archiveKey", "Archive", list, cards.length != 0),
        staticOption("delete", "deleteKey", "Delete", list, cards.length != 0),
    ];
}

function filterMoveList(list: List, lists: List[]) {
    const filteredLists = [];

    for (let i = 0; i < lists.length; i++) {
        if (lists[i].id == list.id) {
            i++; // skip next iteration moving before next is the same as current position
            continue; // skip current can not move before self
        }
        const o = staticOption("moveList", lists[i].id, "Before " + lists[i].name, lists[i])
        filteredLists.push(o);
    }
    if (lists[lists.length - 1].id != list.id) {
        const o = staticOption("moveList", lists[lists.length - 1].id, "After " + lists[lists.length - 1].name, lists[lists.length - 1])
        filteredLists.push(o);
    }
    return filteredLists;
}

function actionMenuSelected(
    key: string | number,
    optionObject: DropdownOption
) {
    if (optionObject.command == "moveList") {
        if (typeof key === 'number') {
            transactions.commit(new ListSortTransaction(data.value.list.id, data.value.list.position, key))
        }
    }

    if (optionObject.command == "edit") {
        $emit("list-edit", data.value.list, $props.list);
    }

    if (optionObject.command == "archive") {
        transactions.commit(new ListArchiveTransaction(data.value.list.id, data.value.list.position, ListArchiveTransaction.Archive));
    }

    if (optionObject.command == "delete" && optionObject.data != null) {
        dialog.warning({
            title: 'Delete',
            content: 'Deleting a list can not be undone, are you sure?',
            positiveText: 'I am sure!',
            negativeText: 'Cancel',
            onPositiveClick: () => {
                transactions.commit(new ListDeleteTransaction(data.value.list.id))
            },
        })
    }
}

const scrollTargetId = uuid1();

const cardTitle = ref("");
const cardTitleInputId = uuid1();

function newCardButtonClicked() {
    if (cardTitle.value != "") {
        transactions.commit(new NewCardTransaction(data.value.list.id, cardTitle.value))
        cardTitle.value = "";
        nextTick(() => document.getElementById(cardTitleInputId)?.focus());
        nextTick(() =>
            document
                .getElementById(scrollTargetId)
                ?.scrollIntoView({ block: "end", behavior: "smooth" })
        );
    }
}

function checkDrag(e: {to: HTMLElement}) { // NOTICE vuedraggable does not export types...
    const listId = e.to.dataset.id
    if (!listId) {
        return false
    }

    const targetList = $props.project.board.findList(listId)
    if(targetList == null) {
        return false
    }

    return targetList.canAcceptCard() || listId === data.value.list.id
}

function dragEvent(e: {moved: {element: List, oldIndex: number, newIndex: number}, added: {element: Card, newIndex: number}}) { // NOTICE vuedraggable does not export types...
    if (e.moved) {
        const card = data.value.list.cards.find(e.moved.element.id)
        if (card != null) {
            transactions.commit(new CardSortTransaction(card.id, e.moved.oldIndex, e.moved.newIndex).preventMutation())
        }
    }
    if (e.added) { // skip removed, we do both in one transaction
        const card = $props.project.board.findCard(e.added.element.id)
        if (card == null) {
            throw new Error("Card[" + e.added.element.id + "] not found")
        }

        const oldList = card.list
        const newList = data.value.list
        const oldPos = card.position
        transactions.commit(new CardMoveTransaction(card.id, oldList.id, oldPos, newList.id, e.added.newIndex).preventMutation())
    }
}

const inputThemeOverrides = {
    border: '0px solid',
    boxShadowFocus: '0px solid',
}

const inputHasFocus = ref(false)

</script>

<style scoped>

:deep() .badge-reset .n-badge-sup {
    pointer-events: none;
}

.list-lane {
  display: inline-block;
  vertical-align: top;
  width: 270px;
  min-width: 160px;
  height: 100%;
}

.list-part {
  background-color: v-bind('theme.listColor');
  display: block;
}

.list-header {
  padding: 7px 7px 7px 7px;
  border-radius: 4px 4px 0 0;
  display: flex;
  justify-content: space-between;
}

.list-footer {
  padding: 0;
  height: 8px;
  border-radius: 0 0 4px 4px;
}

.list-name {
  font-size: 1.5em;
  display: inline-block;
  margin-left: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cards {
  padding: 0 7px 0 7px;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100% - 73px);
}

.cards > *:first-child {
}

.cards > div > .card:not(:last-child) {
  display: block;
  margin-bottom: 17px;
}

.cards > div > .card:last-child {
  display: block;
  margin-bottom: 13px;
}

.cards > *:last-child {
  margin: 3px;
  width: calc(100% - 6px);
}

.ghost-card {
  opacity: 0;
  transform: rotate(0) !important;
}

.drag-card {
  /* do not use transform here since it is overwritten by dragging (dragging works by using a transform to move the element) */
  rotate: -3deg;

}

</style>
