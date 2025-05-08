<template>
    <n-space vertical>
        <InitialFocus />
        <n-space justify="space-between">
            <div>Auto Save</div>
            <n-switch
                v-model:value="projectAutoSave"
                :round="false"
            />
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

const projectAutoSave = ref($props.preferences.projectAutoSave)

watch(projectAutoSave, ()=>transactions.commit(new PreferencesChangeTransaction("projectAutoSave", projectAutoSave.value)))


</script>
<style scoped>
.setting-line {
    width:300px;
    margin-right:20px;
}
</style>
