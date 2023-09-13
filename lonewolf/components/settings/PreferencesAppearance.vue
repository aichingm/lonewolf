<template>
    <n-space vertical>
        <InitialFocus/>
        <n-space justify="space-between">
            <div>List arrangement</div>
            <n-slider class="setting-line" v-model:value="listsJustification" :tooltip="false" :marks="marks" step="mark" />
        </n-space>
        <n-space justify="space-between">
            <div>List width</div>
            <n-slider class="setting-line" v-model:value="listsWidth" step="1" :min="160" :max="1600" :disabled="listsJustification==reverseTranslate('equal')"/>
        </n-space>
    </n-space>
</template>


<script setup lang="ts">
import { ref, watch } from "vue";
import { useTransactions } from '../transactions/api'

import InitialFocus from "@/components/InitialFocus.vue";

import type { PreferencesTransaction } from "@/common/transactions/Transaction";
import { PreferencesChangeTransaction } from "@/common/transactions/PreferencesTransactions";

import type Preferences from "@/common/settings/Preferences"

const $props = defineProps<{
    preferences: Preferences;
}>();

const transactions = useTransactions<PreferencesTransaction>()

const marks = {
    0: 'Left',
    33: 'Center',
    66: 'Spaced',
    100: "Equal",
}

const listsJustification = ref(reverseTranslate($props.preferences.boardListsJustification))
const listsWidth = ref($props.preferences.boardListsWidth)

watch(listsJustification, ()=>transactions.commit(new PreferencesChangeTransaction("boardListsJustification", translateValue(listsJustification.value))))
watch(listsWidth, ()=>transactions.commit(new PreferencesChangeTransaction("boardListsWidth", listsWidth.value)))

//watch(listsJustification, ()=>transactions.commit(new ProjectPreferencesChangeTransaction("boardListsJustification", translateValue(listsJustification.value))))
//watch(listsWidth, ()=>$props.projectPreferences.boardListsWidth = listsWidth.value)
//watch(listsJustification, ()=>$props.projectPreferences.boardListsJustification = translateValue(listsJustification.value))
//watch(listsWidth, ()=>$props.projectPreferences.boardListsWidth = listsWidth.value)


function translateValue(value: number): string{
    switch(value){
    case 0: return "left"
    case 33: return "center"
    case 66: return "space-evenly"
    case 100: return "equal"
    }
    return "left"
}
function reverseTranslate(value: string): number{
    switch(value){
    case "left": return 0
    case "center": return 33
    case "space-evenly": return 66
    case "equal": return 100
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
