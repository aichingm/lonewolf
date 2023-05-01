<template>
    <div class="card">
        <div class="quick-edit">
            <ActionDropdown :options="actions" @selected="actionMenuSelected" />
        </div>
        <n-h3>{{ list.name }}</n-h3>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Ref } from "vue";


import type Board from "@/common/data/Board";
import type List from "@/common/data/List";
import type { SDList } from "@/common/data/extern/SimpleData";

import { ListArchiveTransaction } from "@/common/data/transactions/ListTransactions";

import ActionDropdown from "@/components/ActionDropdown.vue";
import ActionDropdownOption from "@/common/ActionDropdownOption";

const $props = defineProps<{
    list: SDList;
    board: () => Board;
}>();

const $emit = defineEmits(["transaction"]);

const list = computed(()=>{$props.list.version; return $props.board().findListInclArchives($props.list.id);}) as Ref<List> // if list is null, something else is f'ed up

const actions = computed(()=>{$props.list.version; return generateActions()})

const generateActions = function () {
    return [
        new ActionDropdownOption(
            "restoreKey",
            "Restore",
            "restore",
            null,
            null,
            false,
            null
        ),
    ];
};

function actionMenuSelected(
    key: string | number,
    optionObject: ActionDropdownOption
) {

    if (optionObject.command == "restore") {
        $emit("transaction", new ListArchiveTransaction(list.value.id, list.value.position, ListArchiveTransaction.Unarchive));
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
  background-color: #fff;
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
  background-color: #f2f2f2;
}
</style>
