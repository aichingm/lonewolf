<template>
    <n-space vertical>
        <InitialFocus/>
        <n-space justify="space-between">
            <div>Show "New List"</div>
            <n-switch v-model:value="showNewList" :round="false" />
        </n-space>
        <n-space justify="space-between">
            <div>List arrangement</div>
            <n-slider style="width:300px;margin-right:20px;" v-model:value="listsJustification" :tooltip="false" :marks="marks" step="mark" />
        </n-space>
    </n-space>
</template>


<script setup lang="ts">
import { ref, watch } from "vue";

import InitialFocus from "@/components/InitialFocus.vue";
import type Board from "@/common/data/Board";
import { SettingsChangeTransaction } from "@/common/data/transactions/SettingsTransactions";


const $props = defineProps<{
    board: () => Board;
}>();

const marks = {
    0: 'Left',
    50: 'Center',
    100: 'Spaced',
}


const $emit = defineEmits(["transaction"]);

const showNewList = ref($props.board().settings.boardShowNewList)
const listsJustification = ref(reverseTranslate($props.board().settings.boardListsJustification))

watch(showNewList, ()=>$emit("transaction", new SettingsChangeTransaction("boardShowNewList", showNewList.value)))
watch(listsJustification, ()=>$emit("transaction", new SettingsChangeTransaction("boardListsJustification", translateValue(listsJustification.value))))

function translateValue(value: number): string{
    switch(value){
    case 0: return "left"
    case 50: return "center"
    case 100: return "space-evenly"
    }
    return "left"
}
function reverseTranslate(value: string): number{
    switch(value){
    case "left": return 0
    case "center": return 50
    case "space-evenly": return 100
    }
    return 0
}

</script>
<style scoped>


</style>
