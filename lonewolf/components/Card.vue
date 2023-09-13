<template>
    <div class="card" @click="$emit('card-edit', card, $props.card)">
        <div class="badges">
            <CardLabelBadge v-for="l in activeLabels" :key="l.id" :color="l.color" :borderColor="l.color" :name="l.name" />
        </div>
        <div class="quick-edit">
            <ActionDropdown :options="actions" @selected="actionMenuSelected" />
        </div>
        <n-h3>{{ card.name }}</n-h3>
        <n-space :size="[8,0]" justify="left">
            <n-tag v-if="hasDueDate" size="small" round :bordered="false" :type="dueDateType(card.dueDate)">
                <template #icon>
                    <n-icon size="20" >
                        <icon icon="fluent:timer-20-regular" />
                    </n-icon>
                </template>
                <AutoTime :data="card.dueDate || 0" /><!-- passing 0 only to make the compiler happy card.dueDate can not be null since the component is only shown if hasDueDate == true -->
            </n-tag>
            <n-tag v-if="card.comments.filter(c=>!c.deleted).length > 0" size="small" round :bordered="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:comment-48-regular" />
                    </n-icon>
                </template>
                {{ card.comments.filter(c=>!c.deleted).length }}
            </n-tag>
            <n-tag v-if="card.attachments.filter(a=>!a.deleted).length > 0" size="small" round :bordered="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:attach-24-regular" />
                    </n-icon>
                </template>
                {{ card.attachments.filter(a=>!a.deleted).length }}
            </n-tag>
            <n-tag v-if="totalTasks[1] > 0" size="small" type="success" :bordered="false">
                <template #icon>
                    <n-icon size="20" color="#18a058">
                        <icon :icon="totalTasks[0]==0?'fluent:checkbox-unchecked-20-regular':totalTasks[0] == totalTasks[1]?'fluent:checkbox-checked-20-regular':'fluent:checkbox-indeterminate-20-regular'" />
                    </n-icon>
                </template>
                {{ totalTasks[0] + "/" + totalTasks[1]}}
            </n-tag>
        </n-space>
    </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from "vue";
import type { Ref } from "vue";

import CardLabelBadge from "./CardLabelBadge.vue";
import AutoTime from "./AutoTime.vue";

import type Card from "@/common/data/Card";
import type { Card as CardObservable, List as ListObservable, Board as BoardObservable } from "@/common/Observable";
import type Project from "@/common/Project";

import type List from "@/common/data/List";

import { useTransactions } from '@/components/transactions/api'
import { CardSortTransaction, CardMoveTransaction } from "@/common/transactions/CardTransactions";

import ActionDropdown from "./ActionDropdown.vue";
import ActionDropdownOption from "@/common/ActionDropdownOption";
import { taskStats } from "@/utils/markdown";

const $props = defineProps<{
    project: Project;
    board: BoardObservable;
    card: CardObservable;
}>();

const $emit = defineEmits(["card-edit"]);

const transactions = useTransactions()

const card = computed(()=>{$props.card.version; return $props.project.board.findCard($props.card.id);}) as Ref<Card> // if card is null, something else is f'ed up
const lists = computed(()=>$props.board.lists.map((t: ListObservable) : List|null => $props.project.board.findList(t.id)).filter((l=>l!=null)) as List[])
const cards = computed(()=>$props.board.lists[card.value.list.position].cards.map((t: CardObservable) : Card|null => $props.project.board.findCard(t.id)).filter((c=>c!=null)) as Card[])

const activeLabels = computed(()=>card.value.labels.filter(l=>l.visibility));

const tasks = computed(()=>taskStats(card.value.description))

const tasksComments = computed(()=>card.value.comments.map(c=>taskStats(c.content)).reduce((a, v)=> [a[0] + v[0], a[1] + v[1]], [0, 0]))

const totalTasks = computed(()=>[tasks.value[0] + tasksComments.value[0], tasks.value[1] + tasksComments.value[1]])

const hasDueDate = ref(card.value.dueDate!=null)
watch($props.card, ()=> hasDueDate.value = (card.value.dueDate != null))

/*
$props.card.version: why?
lists.value, cards.value: for actions wich have the name of other lists or cards included (move, moveTo)
*/
const actions = computed(()=>{$props.card.version; return generateActions(lists.value, cards.value)})

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
        new ActionDropdownOption(
            "archiveKey",
            "Archive",
            "archive",
            card,
            null,
            false,
            null
        ),
    ];
};

function filterMoveCards(cards: Card[]) {

    const filteredCards = [];
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].id == card.value.id) {
            i++; // skip next iteration moving before next is the same as current position
            continue; // skip current can not move before self
        }
        const o = new ActionDropdownOption(
            i,
            "Before " + cards[i].name,
            "move",
            cards[i],
            null,
            false,
            null
        );
        filteredCards.push(o);
    }
    if (cards.length > 0 && cards[cards.length -1].id != card.value.id) {
        const o = new ActionDropdownOption(
            cards.length,
            "After " + cards[cards.length -1].name,
            "move",
            cards[cards.length -1],
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
        $emit("card-edit", card.value, $props.card);
    }

    if (optionObject.command == "move" && optionObject.data != null) {
        if (typeof key === 'number') {
            // FIXME does not sort correctly when moving card down off by one
            transactions.commit(new CardSortTransaction(card.value.id, card.value.position, key)) 
        }
    }

    if (optionObject.command == "moveTo" && optionObject.data != null) {
        transactions.commit(new CardMoveTransaction(card.value.id, card.value.list.id, card.value.position, optionObject.data.id, 0))
    }

    if (optionObject.command == "archive" && optionObject.data != null) {
        transactions.commit(new CardMoveTransaction(card.value.id, card.value.list.id, card.value.position, $props.project.board.cardArchive.id, 0))
    }
}

function dueDateType (dueDate: number | null): string {
    if(dueDate == null || card.value.list.cardsAreClosed) {
        return "default"
    }
    if(dueDate < Date.now()) {
        return 'error'
    }else{
        if(dueDate > Date.now() + (60*60*24)*1000) {
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
