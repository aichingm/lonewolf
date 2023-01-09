<template>
    <div class="card" @click="$emit('card-edit', card)">
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
            <ActionDropdown :options="actions" @selected="actionMenuSelected" />
        </div>
        <n-h3>{{ card.name }}</n-h3>
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
import type { Ref } from "vue";

import ActionDropdown from "./ActionDropdown.vue";

import type Board from "@/common/data/Board";
import type Card from "@/common/data/Card";
import type List from "@/common/data/List";
import { CardSortTransaction, CardMoveTransaction, TransactionTree } from "@/common/data/Transaction";


import ActionDropdownOption from "@/common/ActionDropdownOption";

const $props = defineProps<{
    data: TransactionTree;
    cards: TransactionTree[];
    lists: TransactionTree[];
    board: () => Board;
}>();

const $emit = defineEmits(["transaction", "card-edit"]);

const card = computed(()=>{$props.data.version; return $props.board().findCard($props.data.id);}) as Ref<Card> // if card is null, something else is f'ed up
const lists = computed(()=>$props.lists.map((t: TransactionTree) : List|null => $props.board().findList(t.id)).filter((l=>l!=null)) as List[])
const cards = computed(()=>$props.cards.map((t: TransactionTree) : Card|null => $props.board().findCard(t.id)).filter((c=>c!=null)) as Card[])

const actions = computed(()=>{$props.data.version; return generateActions(lists.value, cards.value)})

const generateActions = function (lists: List[], cards: Card[]) {
    const cardsChildren = filterMoveCards(cards);
    const listChildren = filterMoveLists(lists);
    return [
        new ActionDropdownOption(
            "editKey",
            "Edit",
            "edit",
            card,
            null,
            false,
            null
        ),
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
};

function filterMoveCards(cards: Card[]) {
    const filteredCards = [];
    let mod = 0;
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].id == card.value.id) {
            mod++;
            i++
            continue;
        }
        const o = new ActionDropdownOption(
            i + mod,
            "Before " + cards[i].name,
            "move",
            cards[i],
            null,
            false,
            null
        );
        filteredCards.push(o);
    }

    if (cards.length > 0 && cards[cards.length - 1].id != card.value.id) {
        const o = new ActionDropdownOption(
            cards.length - 1,
            "After " + cards[cards.length - 1].name,
            "move",
            cards[cards.length - 1],
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
        .filter((l) =>  card.value.list && l.id != card.value.list.id)
        .map((l) => {
            return new ActionDropdownOption(
                l.id,
                l.name,
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
    if (optionObject.command == "edit") {
        $emit("card-edit", card.value);
    }

    if (optionObject.command == "move" && optionObject.data != null) {
        if (typeof key === 'number') {
            $emit("transaction", new CardSortTransaction(card.value.id, card.value.position, key))
        }
    }

    if (optionObject.command == "moveTo" && optionObject.data != null) {
        $emit("transaction", new CardMoveTransaction(card.value.id, card.value.list.id, card.value.position, optionObject.data.id, 0))
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
