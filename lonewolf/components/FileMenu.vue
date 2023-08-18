<template>
    <n-drawer v-model:show="drawer.state.value" :width="280" placement="left">
        <n-drawer-content title="" body-content-style="margin:0;padding:0;" footer-style="display:inline-flex;justify-content:start;padding-left:0;padding-right:0;padding:0;flex-direction: column;">
            <n-menu :options="options" @update:value="menuClicked" :indent="32" :icon-size="0"/>
            <template #footer>
                <n-menu :options="footerOptions" @update:value="menuClicked" :indent="32" :icon-size="0"/>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import type { Ref } from "vue";

const $props = defineProps<{
    show: Ref<boolean>;
}>();

const $emit = defineEmits(["update:show", "action"])

const drawer = { state: ref($props.show.value), show: (value: boolean)=>drawer.state.value = value}
watch($props.show, ()=> drawer.state.value=$props.show.value)
watch(drawer.state, ()=>$emit("update:show", drawer.state))

const options = [
    {
        label: 'New',
        key: 'new',
    },
    {
        key: 'divider-0',
        type: 'divider',
    },
    {
        label: 'Open',
        key: 'open',
    },
    {
        key: 'divider-1',
        type: 'divider',
    },
    {
        label: 'Save',
        key: 'save',
    },
    {
        label: 'Save As...',
        key: 'saveas',
    },
]

const footerOptions = [
    {
        label: 'About',
        key: 'about',
    },
]

const menuClicked = function (key: string) {
    drawer.show(false)
    $emit("action", key)
}


</script>
<style scoped>

</style>
