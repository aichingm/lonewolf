<template>
    <n-space vertical>
        <InitialFocus />
        <n-space justify="space-between">
            <div>Show "New List"</div>
            <n-switch
                v-model:value="showNewList"
                :round="false"
            />
        </n-space>
    </n-space>
</template>


<script setup lang="ts">
import { ref, watch } from "vue";

import InitialFocus from "@/components/InitialFocus.vue";

import { useTransactions } from '../transactions/api'
import { SettingsChangeTransaction } from "@/common/transactions/SettingsTransactions";
import type { BoardTransaction } from "@/common/transactions/Transaction";
import type Project from "@/common/Project";

const $props = defineProps<{
    project: Project;
}>();

const transactions = useTransactions<BoardTransaction>()

const showNewList = ref($props.project.board.settings.boardShowNewList)

watch(showNewList, ()=>transactions.commit(new SettingsChangeTransaction("boardShowNewList", showNewList.value)))

</script>
<style scoped>
.setting-line {
    width:300px;
    margin-right:20px;
}

</style>
