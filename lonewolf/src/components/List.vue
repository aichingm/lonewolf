<template>
    <div class="list-lane">
        <div class="list-header list-part list-dragger">
            <div class="list-name">{{ list.title }}</div>
            <div class="quick-edit">
                <ActionDropdown :options="options" @selected="actionMenuSelected" />
            </div>
        </div>
        <div class="cards list-part list-dragger">
            <!-- eslint-disable vue/no-mutating-props -->
            <draggable
                v-model="list.cards"
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
                        :parentList="list"
                        :lists="$props.lists"
                        @moveCard="(oldPos, newPos) => list.moveCard(oldPos, newPos)"
                        @moveCardTo="moveCardTo"
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
import { ref, nextTick, computed } from "vue";
import draggable from "vuedraggable";
import { v1 as uuid1 } from "uuid";

import CardVue from "./Card.vue";
import ActionDropdown from "./ActionDropdown.vue";
import ActionDropdownOption from "@/common/ActionDropdownOption";

import type Card from "@/common/Card";
import type List from "@/common/List";

const $props = defineProps<{
    list: List;
    lists: List[];
}>();
console.log($props.lists);

const $emit = defineEmits(["moveList", "moveCardTo"]);

const options = computed(() => {
    const children = filterMoveList($props.lists);
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
});

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
            "Before " + lists[i].title,
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
            lists.length,
            "After " + lists[lists.length - 1].title,
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
        $emit("moveList", $props.list.position, key);
    }
}

const scrollTargetId = uuid1();

const cardTitle = ref("");
const cardTitleInputId = uuid1();

function newCardButtonClicked() {
    $props.list.addCard(cardTitle.value);
    cardTitle.value = "";
    nextTick(() => document.getElementById(cardTitleInputId)?.focus());
    nextTick(() =>
        document
            .getElementById(scrollTargetId)
            ?.scrollIntoView({ block: "end", behavior: "smooth" })
    );
}

function moveCardTo(card: Card, newList: List) {
    $emit("moveCardTo", card, $props.list, newList);
}

function dragEvent(_event: object) {
    $props.list.reindexCards();
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
  padding: 10px 7px 0 7px;
  border-radius: 4px 4px 0 0;
}

.list-footer {
  padding: 0;
  height: 8px;
  border-radius: 0 0 4px 4px;
}

.list-name {
  font-size: 1.5em;
  width: calc(100% - 32px);
  display: inline-block;
  margin-left: 3px;
}

.quick-edit {
  display: inline-block;
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
