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
        <div class="quick-edit">
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
                :type="dueDateType(data.card.dueDate)"
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
                v-if="data.card.attachments.length > 0"
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
                {{ data.card.attachments.length }}
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

import { useThemeVars, useDialog } from "naive-ui";
import { themeCast } from "@/themes/theme";

import CardLabelBadge from "@/components/CardLabelBadge.vue";
import AutoTime from "@/components/AutoTime.vue";

import type Card from "@/common/data/Card";
import type { Card as CardObservable, Board as BoardObservable, List as ListObservable } from "@/common/Observable";
import type Project from "@/common/Project";

import type List from "@/common/data/List";

import { useTransactions } from '../transactions/api'
import { CardDeleteArchivedTransaction, CardMoveTransaction } from "@/common/transactions/CardTransactions";

import ActionDropdown from "@/components/ActionDropdown.vue";
import type { DropdownOption } from "@/components/DropdownOption";
import { staticOption, groupOption } from "@/components/DropdownOption";
import { taskStats } from "@/utils/markdown";

const $props = defineProps<{
    project: Project
    board: BoardObservable
    card: CardObservable;
}>();

const $emit = defineEmits(["card-edit"]);

const transactions = useTransactions()

const theme = themeCast(useThemeVars())

const dialog = useDialog()

const data = computed(()=>{

    const card = $props.project.board.findCard($props.card.id) as Card

    const lists = $props.board.lists.map((t: ListObservable) : List|null => $props.project.board.findList(t.id)).filter((l=>l!=null)) as List[]

    const activeLabels = card.labels.filter(l=>l.visibility)

    const tasks = taskStats(card.description)

    const tasksComments = card.comments.map(c=>taskStats(c.content)).reduce((a, v)=> [a[0] + v[0], a[1] + v[1]], [0, 0])

    const totalTasks = [tasks[0] + tasksComments[0], tasks[1] + tasksComments[1]]

    const hasDueDate = card.dueDate!=null

    const actions = generateActions(card, lists)

    return {
        card: card,
        lists: lists,
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

function generateActions(card: Card, lists: List[]): DropdownOption[] {
    const listChildren = filterMoveLists(lists);
    return [
        groupOption("moveTo", "moveToKey", "Move To", null, listChildren, listChildren.length == 0),
        staticOption("delete", "deleteKey", "Delete", card),
    ];
}

function filterMoveLists(lists: List[]) {
    return lists.map((l) => staticOption("moveTo", l.id, l.name, l));
}

function actionMenuSelected(
    key: string | number,
    optionObject: DropdownOption
) {

    if (optionObject.command == "moveTo" && optionObject.data != null) {
        transactions.commit(new CardMoveTransaction(data.value.card.id, data.value.card.list.id, data.value.card.position, optionObject.data.id, 0))
    }

    if (optionObject.command == "delete" && optionObject.data != null) {
        dialog.warning({
            title: 'Delete',
            content: 'Deleting a card can not be undone, are you sure?',
            positiveText: 'I am sure!',
            negativeText: 'Cancel',
            onPositiveClick: () => {
                transactions.commit(new CardDeleteArchivedTransaction(optionObject.data.id))
            },
        })
    }

}

function dueDateType (dueDate: number | null): string {
    if(dueDate == null || data.value.card.list.cardsAreClosed) {
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
