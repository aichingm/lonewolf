<template>
    <n-space vertical>
        <InitialFocus/>
        <n-space justify="space-between">
            <div>Show "New List"</div>
            <n-switch v-model:value="showNewList" :round="false" />
        </n-space>
        <n-space justify="space-between">
            <div>List arrangement</div>
            <n-slider class="setting-line" v-model:value="listsJustification" :tooltip="false" :marks="marks" step="mark" />
        </n-space>
        <n-space justify="space-between">
            <div>List width</div>
            <n-slider class="setting-line" v-model:value="listsWidth" step="1" :min="160" :max="1600"/>
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
const listsWidth = ref($props.board().settings.boardListsWidth)

watch(showNewList, ()=>$emit("transaction", new SettingsChangeTransaction("boardShowNewList", showNewList.value)))
watch(listsJustification, ()=>$emit("transaction", new SettingsChangeTransaction("boardListsJustification", translateValue(listsJustification.value))))
watch(listsWidth, ()=>$emit("transaction", new SettingsChangeTransaction("boardListsWidth", listsWidth.value)))


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
.setting-line {
    width:300px;
    margin-right:20px;
}

</style>
