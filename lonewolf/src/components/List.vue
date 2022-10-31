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
                        :card="element"
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
import { ref, nextTick, shallowRef, watch } from "vue";

import draggable from "vuedraggable";
import { v1 as uuid1 } from "uuid";

import CardVue from "./Card.vue";
import ActionDropdown from "./ActionDropdown.vue";
import ActionDropdownOption from "@/common/ActionDropdownOption";

import type List from "@/common/data/List";
import type Card from "@/common/data/Card";
import { NewCardTransaction, ListSortTransaction, CardSortTransaction, CardMoveTransaction } from "@/common/data/Transaction";


const $props = defineProps<{
    list: List;
}>();

const lists = shallowRef($props.list.board.lists.toArray());
const cards = shallowRef($props.list.cards.toArray());
const actions = shallowRef(new Array<ActionDropdownOption>());


watch($props.list.vueTicker(), () => {
    cards.value = $props.list.cards.toArray();
})

watch($props.list.board.vueTicker(), () => {
    lists.value = $props.list.board.lists.toArray();
    actions.value = generateActions();
})


function generateActions(): ActionDropdownOption[] {
    const children = filterMoveList(lists.value);
    return [
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

actions.value = generateActions();

function filterMoveList(lists: List[]) {
    if (lists.length == 0) {
        return null;
    }

    const filteredLists = [];

    for (let i = 0; i < lists.length; i++) {
        if (lists[i].id == $props.list.id) {
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

    if (lists[lists.length - 1].id != $props.list.id) {
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
            $props.list.board.execTransaction(new ListSortTransaction($props.list, $props.list.position, key))
        }
    }
}

const scrollTargetId = uuid1();

const cardTitle = ref("");
const cardTitleInputId = uuid1();

function newCardButtonClicked() {
    $props.list.execTransaction(new NewCardTransaction($props.list, cardTitle.value))
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
        const card = $props.list.cards.find(e.moved.element.id)
        if (card != null) {
            $props.list.execTransaction(new CardSortTransaction(card, e.moved.oldIndex, e.moved.newIndex))
        }
    }
    if (e.added) { // skip removed, we do both in one transaction
        const oldList = e.added.element.list
        const newList = $props.list
        const oldPos = e.added.element.position
        const card = e.added.element
        card.execTransaction(new CardMoveTransaction(card, oldList, oldPos, newList, e.added.newIndex))
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
