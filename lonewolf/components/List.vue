<template>
    <div class="list-lane" :style="'width: ' + listWidth + 'px'">
        <div class="list-header list-part list-dragger" @click="$emit('list-edit', list, $props.simpleList)">
            <div class="list-name">{{ list.name }}</div>
            <n-space :size="34" item-style="display: flex;">
                <n-badge class="badge-reset" :value="cards.length" show-zero :offset="[20, 11]" color="#d0d0d0">
                    <div>
                    </div>
                </n-badge>
                <ActionDropdown :options="actions" @selected="actionMenuSelected" />
            </n-space>
        </div>
        <div :class="'cards list-part ' + (inputHasFocus?'':'list-dragger')">
            <!-- eslint-disable vue/no-mutating-props -->
            <draggable
                :list="$props.simpleList.cards"
                group="cards"
                animation="200"
                item-key="id"
                ghostClass="ghost-card"
                dragClass="drag-card"
                @change="dragEvent($event)"
                :force-fallback="isChrome()">

                <!-- eslint-enable -->
                <template #item="{ element }">
                    <CardVue
                        :card="element"
                        :board="$props.board"
                        :lists="$props.lists"
                        :cards="cards"
                        :labels="$props.labels"
                        @card-edit="(card, simpleCard)=>$emit('card-edit', card, simpleCard)"
                        @transaction="(t)=>$emit('transaction', t)"
                    />
                </template>
            </draggable>
            <n-input-group>
                <n-input
                    :id="cardTitleInputId"
                    v-model:value="cardTitle"
                    @keyup.enter="newCardButtonClicked()"
                    placeholder="New Card"
                    :theme-overrides="inputThemeOverrides"
                    @focus="inputHasFocus = true"
                    @blur="inputHasFocus = false"
                />
                <n-button type="primary" @click="newCardButtonClicked()" tabindex="-1"
                >+</n-button
                >
            </n-input-group>
            <div :id="scrollTargetId"></div>
        </div>
        <div class="list-footer list-part list-dragger"></div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import type { Ref } from "vue";

import draggable from "vuedraggable";
import { v1 as uuid1 } from "uuid";

import CardVue from "./Card.vue";
import ActionDropdown from "./ActionDropdown.vue";
import ActionDropdownOption from "@/common/ActionDropdownOption";
import { isChrome } from "@/utils/browser-comp";

import type Board from "@/common/data/Board";
import type List from "@/common/data/List";
import type { SDList, SDLabel, SDBoard } from "@/common/data/extern/SimpleData";

import type Card from "@/common/data/Card";


import { ListSortTransaction, ListArchiveTransaction } from "@/common/data/transactions/ListTransactions";
import { NewCardTransaction, CardSortTransaction, CardMoveTransaction } from "@/common/data/transactions/CardTransactions";

const $props = defineProps<{
    board: () => Board;
    simpleBoard: SDBoard;
    simpleList: SDList;
    lists: SDList[];
    labels: SDLabel[];
}>();

const $emit = defineEmits(["transaction", "card-edit", "list-edit"]);

const list = computed(()=>{$props.simpleList.version; return $props.board().findList($props.simpleList.id)}) as Ref<List> // if list is null, something else is f'ed up
const cards = computed(()=>{$props.simpleList.version; return $props.simpleList.cards})

const lists = computed(()=>{$props.simpleList.version; return $props.lists.map((t: SDList) : List|null => $props.board().findList(t.id)).filter(l=>l!=null) as List[]})

const actions = computed(()=>{$props.simpleList.version; return generateActions(lists.value)})

const listWidth = computed(()=>{$props.simpleBoard.settings.version; return $props.board().settings.boardListsWidth})


function generateActions(lists: List[]): ActionDropdownOption[] {
    const children = filterMoveList(lists);
    return [
        new ActionDropdownOption(
            "editKey",
            "Edit",
            "edit",
            list,
            null,
            false,
            null
        ),
        new ActionDropdownOption(
            "moveKey",
            "Move",
            "move",
            null,
            children,
            children?.length == 0,
            null
        ),
        new ActionDropdownOption(
            "archiveKey",
            "Archive",
            "archive",
            null,
            null,
            cards.value.length != 0,
            null
        ),
    ];
}

function filterMoveList(lists: List[]) {
    const filteredLists = [];

    for (let i = 0; i < lists.length; i++) {
        if (lists[i].id == list.value.id) {
            i++; // skip next iteration moving before next is the same as current position
            continue; // skip current can not move before self
        }
        const o = new ActionDropdownOption(
            i,
            "Before " + lists[i].name,
            "moveList",
            null,
            null,
            false,
            null
        );
        filteredLists.push(o);
    }
    if (lists[lists.length - 1].id != list.value.id) {
        const o = new ActionDropdownOption(
            lists.length,
            "After " + lists[lists.length - 1].name,
            "moveList",
            null,
            null,
            false,
            null
        );
        filteredLists.push(o);
    }
    return filteredLists;
}

function actionMenuSelected(
    key: string | number,
    optionObject: ActionDropdownOption
) {
    if (optionObject.command == "moveList") {
        if (typeof key === 'number') {
            $emit("transaction", new ListSortTransaction(list.value.id, list.value.position, key))
        }
    }

    if (optionObject.command == "edit") {
        $emit("list-edit", list.value, $props.simpleList);
    }

    if (optionObject.command == "archive") {
        $emit("transaction", new ListArchiveTransaction(list.value.id, list.value.position, ListArchiveTransaction.Archive));
    }
}

const scrollTargetId = uuid1();

const cardTitle = ref("");
const cardTitleInputId = uuid1();

function newCardButtonClicked() {
    if (cardTitle.value != "") {
        $emit("transaction", new NewCardTransaction(list.value.id, cardTitle.value))
        cardTitle.value = "";
        nextTick(() => document.getElementById(cardTitleInputId)?.focus());
        nextTick(() =>
            document
                .getElementById(scrollTargetId)
                ?.scrollIntoView({ block: "end", behavior: "smooth" })
        );
    }
}

function dragEvent(e: {moved: {element: List, oldIndex: number, newIndex: number}, added: {element: Card, newIndex: number}}) {
    if (e.moved) {
        const card = list.value.cards.find(e.moved.element.id)
        if (card != null) {
            $emit("transaction", new CardSortTransaction(card.id, e.moved.oldIndex, e.moved.newIndex).preventMutation())
        }
    }
    if (e.added) { // skip removed, we do both in one transaction
        const card = $props.board().findCard(e.added.element.id)
        if (card == null) {
            throw new Error("Card[" + e.added.element.id + "] not found")
        }

        const oldList = card.list
        const newList = list.value
        const oldPos = card.position
        $emit("transaction", new CardMoveTransaction(card.id, oldList.id, oldPos, newList.id, e.added.newIndex).preventMutation())
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
  background-color: #e9e9ed;
  display: block;
}

.list-header {
  padding: 7px 7px 0 7px;
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
  overflow-y: scroll;
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
  rotate: -3deg;
}
</style>
