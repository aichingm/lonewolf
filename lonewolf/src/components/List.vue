<template>
    <div class="list-lane">
        <div class="list-header list-part list-dragger">
            <div class="list-name">{{ list.name }}</div>
            <ActionDropdown :options="actions" @selected="actionMenuSelected" />
        </div>
        <div class="cards list-part list-dragger">
            <!-- eslint-disable vue/no-mutating-props -->
            <draggable
                v-model="cards"
                group="cards"
                animation="200"
                item-key="id"
                ghostClass="ghost-card"
                dragClass="drag-card"
                @change="dragEvent($event)"
            >
                <!-- eslint-enable -->
                <template #item="{ element }">
                    <CardVue
                        :data="element"
                        :board="$props.board"
                        :lists="lists"
                        :cards="cards"
                        @card-edit="(card)=>$emit('card-edit', card)"
                        @transaction="(...args)=>$emit('transaction', ...args)"
                    />
                </template>
            </draggable>
            <n-input-group>
                <n-input
                    :id="cardTitleInputId"
                    v-model:value="cardTitle"
                    @keyup.enter="newCardButtonClicked()"
                    placeholder="New Card"
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

import draggable from "vuedraggable";
import { v1 as uuid1 } from "uuid";

import CardVue from "./Card.vue";
import ActionDropdown from "./ActionDropdown.vue";
import ActionDropdownOption from "@/common/ActionDropdownOption";

import type Board from "@/common/data/Board";
import type List from "@/common/data/List";
import type Card from "@/common/data/Card";

import { TransactionTree, NewCardTransaction, ListSortTransaction, CardSortTransaction, CardMoveTransaction } from "@/common/data/Transaction";


const $props = defineProps<{
    board: () => Board;
    data: TransactionTree;
    lists: Array<TransactionTree>;
}>();

const $emit = defineEmits(["transaction", "card-edit", "list-edit"]);
/*
const boardRef = shallowRef($props.data.data)
const board = ()=> boardRef.value
const listRef = shallowRef(board().findList($props.listId));
const list = ()=> listRef.value
const listsRef = shallowRef(list().board.lists.toArray());
const lists = ()=> listsRef.value
const cardsRef = shallowRef(list().cards.toArray());
const cards = ()=> cardsRef.value
const actionsRef = shallowRef(new Array<ActionDropdownOption>());
const actions = ()=> actionsRef.value


watch($props.data.node(list().id), () => {
    listRef.value = board().findList($props.listId);
    cardsRef.value = list().cards.toArray();
})

watch($props.data.rootNode(), () => {
    if($props.data.data.findList($props.listId) == null) {
        // NOTICE this list seams to be removed from the board, but the board update notification goes though anyways
        return
    }

    boardRef.value = $props.data.data
    listRef.value = board().findList($props.listId);
    listsRef.value = list().board.lists.toArray();
    cardsRef.value = list().cards.toArray();
    actionsRef.value = generateActions();
})*/

const cards = computed(()=>$props.data.nodes.map((t: TransactionTree) : Card => $props.board().findCard(t.id)))
const lists = computed(()=>$props.lists.map((t: TransactionTree) : List => $props.board().findList(t.id)))
const actions = computed(()=>generateActions(lists.value))
const list = computed(()=>$props.board().findList($props.data.id))

function generateActions(lists): ActionDropdownOption[] {
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
    ];
}

function filterMoveList(lists: List[]) {
    if (lists.length == 0) {
        return null;
    }

    const filteredLists = [];

    for (let i = 0; i < lists.length; i++) {
        if (lists[i].id == list.value.id) {
            i++;
            continue;
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
            lists.length - 1,
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
        $emit("list-edit", optionObject.data);
    }
}

const scrollTargetId = uuid1();

const cardTitle = ref("");
const cardTitleInputId = uuid1();

function newCardButtonClicked() {
    $emit("transaction", new NewCardTransaction(list.value.id, cardTitle.value))
    cardTitle.value = "";
    nextTick(() => document.getElementById(cardTitleInputId)?.focus());
    nextTick(() =>
        document
            .getElementById(scrollTargetId)
            ?.scrollIntoView({ block: "end", behavior: "smooth" })
    );
}

function dragEvent(e: {moved: {element: List, oldIndex: number, newIndex: number}, added: {element: Card, newIndex: number}}) {
    if (e.moved) {
        const card = list.value.cards.find(e.moved.element.id)
        if (card != null) {
            $emit("transaction", new CardSortTransaction(card.id, e.moved.oldIndex, e.moved.newIndex))
        }
    }
    if (e.added) { // skip removed, we do both in one transaction
        const oldList = e.added.element.list
        const newList = list.value
        const oldPos = e.added.element.position
        const card = e.added.element
        $emit("transaction", new CardMoveTransaction(card.id, oldList.id, oldPos, newList.id, e.added.newIndex))
    }
}

</script>

<style scoped>
.list-lane {
  display: inline-block;
  vertical-align: top;
  margin-right: 10px;
  width: 270px;
  vertical-align: top;
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
  transform: rotate(-3deg) !important;
}
</style>
