<template>
    <div class="card">
        <div class="badges">
            <div class="badge"></div>
            <div class="badge"></div>
            <div class="badge"></div>
            <div class="badge"></div>
            <div class="badge"></div>
            <div class="badge"></div>
            <div class="badge"></div>
            <div class="badge"></div>
            <div class="badge"></div>
        </div>
        <div class="quick-edit">
            <ActionDropdown :options="options" @selected="actionMenuSelected" />
        </div>
        <n-h3>{{ card.title }}</n-h3>
        <div class="tags">
            <n-tag size="small" round :bordered="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:comment-48-regular" />
                    </n-icon>
                </template>
                9
            </n-tag>
            <n-tag size="small" round :bordered="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:attach-24-regular" />
                    </n-icon>
                </template>
                18
            </n-tag>
            <n-tag size="small" type="success" :bordered="false">
                <template #icon>
                    <n-icon size="20" color="#18a058">
                        <icon icon="fluent:checkbox-checked-24-regular" />
                    </n-icon>
                </template>
                3/18
            </n-tag>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import ActionDropdown from "./ActionDropdown.vue";

import type Card from "@/common/Card";
import type List from "@/common/List";

import ActionDropdownOption from "@/common/ActionDropdownOption";

const $props = defineProps<{
    card: Card;
    parentList: List;
    lists: List[];
}>();

const $emit = defineEmits(["moveCard", "moveCardTo"]);

const options = computed(() => {
    const cardsChildren = filterMoveCards($props.parentList.cards);
    const listChildren = filterMoveLists($props.lists);
    return [
        new ActionDropdownOption(
            "moveKey",
            "Move",
            "move",
            null,
            cardsChildren,
            cardsChildren.length == 0,
            null
        ),
        new ActionDropdownOption(
            "moveToKey",
            "Move To",
            "moveTo",
            null,
            listChildren,
            listChildren.length == 0,
            null
        ),
    ];
});

function filterMoveCards(cards: Card[]) {
    const filteredCards = [];
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].id == $props.card.id) {
            i++;
            continue;
        }
        const o = new ActionDropdownOption(
            i,
            "Before " + cards[i].title,
            "move",
            null,
            null,
            false,
            null
        );
        filteredCards.push(o);
    }

    if (cards.length > 0 && cards[cards.length - 1].id != $props.card.id) {
        const o = new ActionDropdownOption(
            cards.length,
            "After " + cards[cards.length - 1].title,
            "move",
            null,
            null,
            false,
            null
        );
        filteredCards.push(o);
    }
    return filteredCards;
}

function filterMoveLists(lists: List[]) {
    return lists
        .filter((l) => l.id != $props.parentList.id)
        .map((l) => {
            return new ActionDropdownOption(
                l.id,
                l.title,
                "moveTo",
                l,
                null,
                false,
                null
            );
        });
}

function actionMenuSelected(
    key: string | number,
    optionObject: ActionDropdownOption
) {
    if (optionObject.command == "move") {
        $emit("moveCard", $props.card.position, key);
    }

    if (optionObject.command == "moveTo") {
        $emit("moveCardTo", $props.card, optionObject.data);
    }
}
</script>

<style scoped>
.badges {
  display: inline-flex;
  width: calc(100% - 30px);
  vertical-align: top;
}

.badge {
  height: 8px;
  width: 40px;
  border-radius: 4px;
  background-color: #ca4e4e;
  margin-right: 4px;
  margin-bottom: 4px;
}

.quick-edit {
  display: inline-block;
  margin-top: -4px;
  margin-bottom: -4px;
  margin-left: 6px;
}

.tags {
  display: flex;
}

.tags > *:not(:last-child) {
  margin-right: 4px;
}

.card {
  background-color: #fff;
  border-radius: 3px;
  box-shadow: 0 8px 6px -6px black;
  padding: 8px;
  margin-left: 3px;
  margin-right: 3px;
  --border: solid 1px #ff4949;
}

.card > .n-h3 {
  margin-top: -8px;
  margin-bottom: 18px;
  width: 100%;
  white-space: normal;
  line-height: 20px;
}

.card:hover {
  background-color: #f2f2f2;
}
</style>
