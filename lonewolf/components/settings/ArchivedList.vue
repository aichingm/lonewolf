<template>
    <div class="card">
        <div class="quick-edit">
            <ActionDropdown
                :options="actions"
                @selected="actionMenuSelected"
            />
        </div>
        <n-h3>{{ list.name }}</n-h3>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Ref } from "vue";

import { useThemeVars, useDialog } from "naive-ui";
import { themeCast } from "@/themes/theme";

import type List from "@/common/data/List";
import type { List as ListObservable} from "@/common/Observable";
import type Project from "@/common/Project";

import { useTransactions } from '../transactions/api'
import { ListDeleteArchivedTransaction, ListArchiveTransaction } from "@/common/transactions/ListTransactions";

import ActionDropdown from "@/components/ActionDropdown.vue";
import { staticOption } from "@/components/DropdownOption";
import type { DropdownOption } from "@/components/DropdownOption";

const $props = defineProps<{
    project: Project;
    list: ListObservable;
}>();

const transactions = useTransactions()

const theme = themeCast(useThemeVars())

const dialog = useDialog()

// NOTICE computed is not a function but a macro, we need to tell the macro that it should depend on a Proxy changing thats why we have unused expressions in computed macros
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
const list = computed(()=>{$props.list.version; return $props.project.board.findListInclArchives($props.list.id);}) as Ref<List> // if list is null, something else is f'ed up

// NOTICE computed is not a function but a macro, we need to tell the macro that it should depend on a Proxy changing thats why we have unused expressions in computed macros
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
const actions = computed(()=>{$props.list.version; return generateActions($props.list.id)})

function generateActions(listId: string): DropdownOption[] {
    return [
        staticOption("restore", "restoreKey", "Restore", listId),
        staticOption("delete", "deleteKey", "Delete", listId),
    ];
}

function actionMenuSelected(
    key: string | number,
    optionObject: DropdownOption
) {

    if (optionObject.command == "restore") {
        // TODO list.value.position should be read from the optionObject.data field
        transactions.commit(new ListArchiveTransaction(optionObject.data, list.value.position, ListArchiveTransaction.Unarchive));
    }

    if (optionObject.command == "delete" && optionObject.data != null) {
        dialog.warning({
            title: 'Delete',
            content: 'Deleting a list can not be undone, are you sure?',
            positiveText: 'I am sure!',
            negativeText: 'Cancel',
            onPositiveClick: () => {
                transactions.commit(new ListDeleteArchivedTransaction(optionObject.data))
            },
        })
    }

}

</script>

<style scoped>
.quick-edit {
    display: flex;
    justify-content: end;
    width: 100%;
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
