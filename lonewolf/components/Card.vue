<template>
    <div
        class="card"
        @click="$emit('card-edit', data.card, $props.card)"
    >
        <div class="badges">
            <CardLabelBadge
                v-for="l in data.activeLabels"
                :key="l.id"
                :color="l.color"
                :border-color="l.color"
                :name="l.name"
            />
        </div>
        <div
            class="quick-edit"
            @click.stop
        >
            <ActionDropdown
                :options="data.actions"
                @selected="actionMenuSelected"
            />
        </div>
        <n-h3>{{ data.card.name }}</n-h3>
        <n-space
            :size="[8,0]"
            justify="left"
        >
            <n-tag
                v-if="data.hasDueDate"
                size="small"
                round
                :bordered="false"
                :type="dueDateType(data.card)"
            >
                <template #icon>
                    <n-icon size="20">
                        <icon icon="fluent:timer-20-regular" />
                    </n-icon>
                </template>
                <AutoTime :data="data.card.dueDate || 0" /><!-- passing 0 only to make the compiler happy card.dueDate can not be null since the component is only shown if hasDueDate == true -->
            </n-tag>
            <n-tag
                v-if="data.card.comments.filter(c=>!c.deleted).length > 0"
                size="small"
                round
                :bordered="false"
            >
                <template #icon>
                    <n-icon
                        size="20"
                        color="gray"
                    >
                        <icon icon="fluent:comment-20-regular" />
                    </n-icon>
                </template>
                {{ data.card.comments.filter(c=>!c.deleted).length }}
            </n-tag>
            <n-tag
                v-if="data.card.attachments.filter(a=>!a.deleted).length > 0"
                size="small"
                round
                :bordered="false"
            >
                <template #icon>
                    <n-icon
                        size="20"
                        color="gray"
                    >
                        <icon icon="fluent:attach-20-regular" />
                    </n-icon>
                </template>
                {{ data.card.attachments.filter(a=>!a.deleted).length }}
            </n-tag>
            <n-tag
                v-if="data.totalTasks[1] > 0"
                size="small"
                type="success"
                :bordered="false"
            >
                <template #icon>
                    <n-icon
                        size="20"
                        color="#18a058"
                    >
                        <icon :icon="data.totalTasks[0]==0?'fluent:checkbox-unchecked-20-regular':data.totalTasks[0] == data.totalTasks[1]?'fluent:checkbox-checked-20-regular':'fluent:checkbox-indeterminate-20-regular'" />
                    </n-icon>
                </template>
                {{ data.totalTasks[0] + "/" + data.totalTasks[1] }}
            </n-tag>
        </n-space>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useThemeVars } from 'naive-ui'
import { themeCast } from '@/themes/theme'


import CardLabelBadge from "./CardLabelBadge.vue";
import AutoTime from "./AutoTime.vue";

import type Card from "@/common/data/Card";
import type { Card as CardObservable, List as ListObservable, Board as BoardObservable } from "@/common/Observable";
import type Project from "@/common/Project";

import type List from "@/common/data/List";

import { useTransactions } from '@/components/transactions/api'
import { CardSortTransaction, CardMoveTransaction } from "@/common/transactions/CardTransactions";

import ActionDropdown from "./ActionDropdown.vue";
import type { DropdownOption } from "./DropdownOption";
import { staticOption, groupOption } from "./DropdownOption";
import { taskStats } from "@/utils/markdown";

const $props = defineProps<{
    project: Project;
    board: BoardObservable;
    card: CardObservable;
}>();

const $emit = defineEmits(["card-edit"]);

const theme = themeCast(useThemeVars())

const transactions = useTransactions()

const data = computed(()=>{

    const card = $props.project.board.findCard($props.card.id) as Card

    const lists = $props.board.lists.map((t: ListObservable) : List|null => $props.project.board.findList(t.id)).filter((l=>l!=null)) as List[]

    const cards = $props.board.lists[card.list.position].cards.map((t: CardObservable) : Card|null => $props.project.board.findCard(t.id)).filter((c=>c!=null)) as Card[]

    const activeLabels = card.labels.filter(l=>l.visibility)

    const tasks = taskStats(card.description)

    const tasksComments = card.comments.map(c=>taskStats(c.content)).reduce((a, v)=> [a[0] + v[0], a[1] + v[1]], [0, 0])

    const totalTasks = [tasks[0] + tasksComments[0], tasks[1] + tasksComments[1]]

    const hasDueDate = card.dueDate!=null

    const actions = generateActions(card, lists, cards)

    return {
        card: card,
        lists: lists,
        cards: cards,
        activeLabels: activeLabels,
        tasks: tasks,
        tasksComments: tasksComments,
        totalTasks: totalTasks,
        hasDueDate: hasDueDate,
        actions: actions,
        labelsObservable: $props.board.labels.version,
        version: $props.card.version // this triggers the recomputation in case of a change in the card
    }
})

function generateActions (card: Card, lists: List[], cards: Card[]): DropdownOption[] {
    const cardsChildren = filterMoveCards(card, cards);
    const listChildren = filterMoveLists(card, lists);
    return [
        staticOption("edit", "editKey", "Edit", card),
        groupOption("move", "moveKey", "Move", card, cardsChildren, cardsChildren.length == 0),
        groupOption("moveTo", "moveToKey", "Move To", card, listChildren, listChildren.length == 0),
        staticOption("archive", "archiveKey", "Archive", card),
    ];
}

function filterMoveCards(card: Card, cards: Card[]) {

    const filteredCards = [];
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].id == card.id) {
            i++; // skip next iteration moving before next is the same as current position
            continue; // skip current can not move before self
        }
        const o = staticOption("move", i, "Before " + cards[i].name, cards[i])
        filteredCards.push(o);
    }
    if (cards.length > 0 && cards[cards.length -1].id != card.id) {
        const o = staticOption("move", cards.length, "After " + cards[cards.length -1].name, cards[cards.length -1])
        filteredCards.push(o);
    }
    return filteredCards;
}

function filterMoveLists(card: Card, lists: List[]) {
    return lists
        .map((l) => {
            const list = $props.project.board.findList(l.id)
            const canAccept = list != null && list.canAcceptCard()
            const isNotOwn = card.list != null && l.id != card.list.id
            return staticOption("moveTo", l.id, l.name, l, !canAccept || !isNotOwn)
        });
}

function actionMenuSelected(
    key: string | number,
    optionObject: DropdownOption
) {
    if (optionObject.command == "edit") {
        $emit("card-edit", data.value.card, $props.card);
    }

    if (optionObject.command == "move" && optionObject.data != null) {
        if (typeof key === 'number') {
            // FIXME does not sort correctly when moving card down off by one
            transactions.commit(new CardSortTransaction(data.value.card.id, data.value.card.position, key))
        }
    }

    if (optionObject.command == "moveTo" && optionObject.data != null) {
        transactions.commit(new CardMoveTransaction(data.value.card.id, data.value.card.list.id, data.value.card.position, optionObject.data.id, 0))
    }

    if (optionObject.command == "archive" && optionObject.data != null) {
        transactions.commit(new CardMoveTransaction(data.value.card.id, data.value.card.list.id, data.value.card.position, $props.project.board.cardArchive.id, 0))
    }
}

function dueDateType (card: Card): string {
    if(card.dueDate == null || card.list.cardsAreClosed) {
        return "default"
    }
    if(card.dueDate < Date.now()) {
        return 'error'
    }else{
        if(card.dueDate > Date.now() + (60*60*24)*1000) {
            return 'default'
        }
        return 'warning'
    }
}
</script>

<style scoped>
.badges {
  display: inline-flex;
  width: calc(100% - 30px);
  vertical-align: top;
  overflow: hidden;
}

.quick-edit {
  display: inline-block;
  margin-top: -4px;
  margin-bottom: -4px;
  margin-left: 6px;
}

.card {
  background-color: v-bind('theme.cardColor');
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
  background-color: v-bind('theme.cardColorHover');
}
</style>
