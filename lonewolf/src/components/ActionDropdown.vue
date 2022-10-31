<template>
    <n-dropdown
        :show="showRef"
        :options="fixedOptions"
        placement="right-start"
        @select="selected"
    >
        <n-button
            :id="showButtonId"
            quaternary
            size="tiny"
            @focus="show(true)"
            @blur="show(false)"
            @click.stop
        >
            <template #icon>
                <n-icon size="16" color="gray">
                    <icon icon="fluent:more-horizontal-20-regular" />
                </n-icon>
            </template>
        </n-button>
    </n-dropdown>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { v1 as uuid1 } from "uuid";

import type ActionDropdownOption from "@/common/ActionDropdownOption";

const $props = defineProps<{
    options: ActionDropdownOption[];
}>();

const $emit = defineEmits(["selected"]);

const showButtonId = uuid1();
const showRef = ref(false);

function show(value: boolean) {
    showRef.value = value;
}
function selected(key: string | number, optionObject: ActionDropdownOption) {
    show(false);
    $emit("selected", key, optionObject);
    document.getElementById(showButtonId)?.blur();
}

const fixedOptions = computed(() => fixOptions($props.options));

function fixOptions(optList: ActionDropdownOption[]) {
    for (const item of optList) {
        item.props = { onMousedown: () => selected(item.key, item) };
        if (item.children != null) {
            item.children = fixOptions(item.children);
        } else {
            item.children = undefined; // the dropdown draws an arrow if the `children` field is defined
        }
    }
    return optList;
}
</script>
