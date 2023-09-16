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
            <n-tag v-if="card.attachments.length > 0" size="small" round :bordered="false">
                <template #icon>
                    <n-icon size="20" color="gray">
                        <icon icon="fluent:attach-24-regular" />
                    </n-icon>
                </template>
                {{ card.attachments.length }}
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

import { useThemeVars } from "naive-ui";
import { themeCast } from "@/themes/theme";

import CardLabelBadge from "@/components/CardLabelBadge.vue";
import AutoTime from "@/components/AutoTime.vue";

import type Card from "@/common/data/Card";
import type { Card as CardObservable, Board as BoardObservable, List as ListObservable } from "@/common/Observable";
import type Project from "@/common/Project";

import type List from "@/common/data/List";

import { useTransactions } from '../transactions/api'
import { CardMoveTransaction } from "@/common/transactions/CardTransactions";

import ActionDropdown from "@/components/ActionDropdown.vue";
import ActionDropdownOption from "@/common/ActionDropdownOption";
import { assignArray } from "@/utils/vue";
import { taskStats } from "@/utils/markdown";

const $props = defineProps<{
    project: Project
    board: BoardObservable
    card: CardObservable;
}>();

const $emit = defineEmits(["card-edit"]);

const transactions = useTransactions()

const theme = themeCast(useThemeVars())

const card = computed(()=>{$props.card.version; return $props.project.board.findCard($props.card.id);}) as Ref<Card> // if card is null, something else is f'ed up
const lists = computed(()=>$props.board.lists.map((t: ListObservable) : List|null => $props.project.board.findList(t.id)).filter((l=>l!=null)) as List[])

const activeLabels = ref([...card.value.labels.filter(l=>l.visibility)])
watch([$props.board.labels, $props.card], ()=> assignArray(activeLabels, card.value.labels.filter(l=>l.visibility)))

const tasks = computed(()=>taskStats(card.value.description))

const tasksComments = computed(()=>card.value.comments.map(c=>taskStats(c.content)).reduce((a, v)=> [a[0] + v[0], a[1] + v[1]], [0, 0]))

const totalTasks = computed(()=>[tasks.value[0] + tasksComments.value[0], tasks.value[1] + tasksComments.value[1]])

const hasDueDate = ref(card.value.dueDate!=null)
watch($props.card, ()=> hasDueDate.value = (card.value.dueDate != null))

/*
$props.card.version: why?
lists.value, cards.value: for actions wich have the name of other lists or cards included (move, moveTo)
*/
const actions = computed(()=>{$props.card.version; return generateActions(lists.value)})

const generateActions = function (lists: List[]) {
    const listChildren = filterMoveLists(lists);
    return [
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


function filterMoveLists(lists: List[]) {
    return lists.map((l) => {
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

    if (optionObject.command == "moveTo" && optionObject.data != null) {
        transactions.commit(new CardMoveTransaction(card.value.id, card.value.list.id, card.value.position, optionObject.data.id, 0))
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
  width: calc(100% - 32px);
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
  margin-left: 10px;
  margin-right: 10px;
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
