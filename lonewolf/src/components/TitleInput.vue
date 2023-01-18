<template>
    <div v-if="!editMode" tabindex="0" @focus="showEdit()">{{ modelTitle }}</div>
    <n-input ref="titleEditInput" v-if="editMode" @blur="hideEdit()" type="text" v-model:value="modelTitle" :placeholder="modelTitle" />
</template>
<script setup lang="ts">
import { ref, nextTick } from "vue";
import type { Ref } from "vue";
import type { NInput } from 'naive-ui';

const $props = defineProps<{
    title: string;
}>();

const $emit = defineEmits(["update:title"]);

const titleEditInput = ref(null) as Ref<typeof NInput | null>
const editMode = ref(false)

let originalTitle = ref($props.title).value;
const modelTitle = ref($props.title);



const hideEdit = () => {
    editMode.value = false
    if (originalTitle != modelTitle.value) {
        originalTitle = modelTitle.value
        $emit("update:title", modelTitle.value)
    }
}

const showEdit = () => {
    editMode.value = true;
    nextTick(() => {
        if(titleEditInput.value != null){titleEditInput.value.focus()}
    }) // have to use nextTick since v-if only creates and updates the ref after the component is created, which happens at the end of this tick
}

defineExpose({ titleEditInput })

</script>
<style>
</style>
