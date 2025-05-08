<template>
    <n-color-picker
        show-preview
        :show-alpha="false"
        :actions="$props.confirmable?['confirm']:[]"
        :modes="['hex']"
        :default-value="$props.color"
        @update:value="onUpdate"
        @confirm="onConfirm"
        @key-down="handleKeyDown"
    >
        <template #label>
            <slot name="trigger" />
        </template>
    </n-color-picker>
</template>


<script setup lang="ts">

const $props = defineProps<{
    color: string;
    confirmable: boolean;
}>();

const $emit = defineEmits(["update", "confirm"]);


function onConfirm(value: string) {
    $emit("confirm", value)
}
function onUpdate(value: string) {
    $emit("update", value)
}

const handleKeyDown = function(_e: Event) {
    (()=>true)() // TODO check if we can grab esc key here and close color picker
}

</script>

<style scoped>

.n-color-picker {
    display: flex;
    box-sizing: unset;
    height: 100%;
}

:deep() .n-color-picker-checkboard {
    display: unset;
}
:deep() .n-color-picker-trigger__fill {
    display: inline-flex;
    align-items: unset;
    justify-content: unset;
    left: unset;
    right: unset;
    top: unset;
    bottom: unset;
    position:unset;
}
:deep() .n-color-picker-trigger {
    display: inline-flex;
    border: unset;
    height: unset;
    box-sizing: unset;
    border-radius: unset;
    transition: unset;
}
:deep() .n-color-picker-trigger__fill > :nth-child(1), :deep() .n-color-picker-trigger__fill > :nth-child(2) {
    display:none;
}
:deep() .n-color-picker-trigger__value {
    color: unset !important;
}
</style>
