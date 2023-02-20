<template>
    <n-space>
        <n-tag   v-for="l in $props.activeLabels" :key="l.id" :theme-overrides="themeOverwrite(l.color)" :color="tagColor(l.color)" closable @close="removeLabel(l)">{{ l.name }}</n-tag>
        <n-popover ref="labelPopUp" trigger="click" placement="bottom" show-arrow v-model:show="showAddBoxModel">
            <template #trigger>
                <n-button dashed class="tag-sized-button">+</n-button>
            </template>
            <FilterableSelectBox :options="newLabels" @selected="addById" @blur="showAddBoxModel = false"/>
        </n-popover>
    </n-space>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import type { Ref } from "vue";
import { themeOverwrite, tagColor } from "@/utils/labels";
import FilterableSelectBox from "./FilterableSelectBox.vue";
import type Label from "@/common/data/Label";
import type { SDLabel } from "@/common/data/extern/SimpleData";
import type Board from "@/common/data/Board";
import type { NPopover } from "naive-ui";

const $props = defineProps<{
    labels: SDLabel[];
    activeLabels: Label[];
    board: () => Board;
}>();

const $emit = defineEmits(["add", "remove"]);

const showAddBoxModel = ref(false)

const newLabels = computed(
    ()=>$props.labels.map(
        (l: SDLabel) : Label|null => $props.board().findLabel(l.id)
    ).filter(
        (l) => (l != null && l.visibility && $props.activeLabels.findIndex((al) => al.id == l.id) == -1)
    ) as Label[]) // get all labels except those which are in the activeLables array

const labelPopUp = ref(null) as Ref<typeof NPopover | null>;

function addById(id: string) {
    setTimeout(() => {if(labelPopUp.value != null) {labelPopUp.value.syncPosition()}}, 1) // nextTick does not work for whatever reason
    $emit("add", id)
}

function removeLabel(l: Label) {
    $emit("remove", l.id)
}

defineExpose({ labelPopUp })


</script>
<style scoped>
:deep() .n-tag {
    cursor: pointer;
}

:deep() .labelEdit > div:first-child{
    flex: 1;
}

.tag-list-item:hover{
    filter: brightness(60%);
}

.tag-sized-button {
    height: 28px;
}

</style>
