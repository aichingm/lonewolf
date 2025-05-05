<template>
    <n-dropdown
        :show="showRef"
        :options="$props.options"
        placement="right-start"
        @select="selected"
        @clickoutside="show(false)"
    >
        <n-button
            :id="showButtonId"
            quaternary
            size="tiny"
            @focus="show(true)"
            @keydown.tab="show(false)"
        >
            <template #icon>
                <n-icon
                    size="16"
                    color="gray"
                >
                    <icon icon="fluent:more-horizontal-20-regular" />
                </n-icon>
            </template>
        </n-button>
    </n-dropdown>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { v1 as uuid1 } from "uuid";
import type { DropdownOption } from "./DropdownOption"

const $props = defineProps<{
    options: DropdownOption[];
}>();

const $emit = defineEmits(["selected"]);

const showButtonId = uuid1();
const showRef = ref(false);

function show(value: boolean) {
    showRef.value = value;
}

function selected(key: string | number, optionObject: DropdownOption) {
    show(false);
    $emit("selected", key, optionObject);
    document.getElementById(showButtonId)?.blur();
}

</script>
