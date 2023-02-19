<template>
    <n-modal
        v-model:show="showModel"
    >
        <n-card
            class="card"
            title="Modal"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"

        >
            <template #header>
                Settings
            </template>
            <template #header-extra>
            </template>
            <n-space vertical class="reset-left-card-margin">
                <n-layout has-sider>
                    <n-layout-sider
                        bordered
                        collapse-mode="width"
                        :collapsed-width="64"
                        :width="240"
                        :collapsed="collapsedModel"
                        show-trigger
                        @collapse="collapsedModel = true"
                        @expand="collapsedModel = false"
                    >
                        <n-menu
                            :collapsed="collapsedModel"
                            :collapsed-width="64"
                            :collapsed-icon-size="22"
                            :options="menuOptions"
                            v-model:value="menuModel"
                        />
                    </n-layout-sider>
                    <n-layout class="settings-content-pane">
                        <LabelsManager v-if="menuModel == 'labels'" :board="$props.board" :labels="$props.labels" @transaction="(t)=>$emit('transaction', t)"/>
                    </n-layout>
                </n-layout>
            </n-space>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, h } from "vue";
import type { Ref } from "vue";
import type Board from "@/common/data/Board";
import LabelsManager from "@/components/settings/LabelsManager.vue";
import type { SDLabel } from "@/common/data/extern/SimpleData";


import { Icon } from "@iconify/vue";
import { NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'

const $props = defineProps<{
    board: () => Board;
    show: Ref<boolean>;
    labels: SDLabel[];

}>();

function renderIcon (iconName: string) {
    return () => h(NIcon, null, { default: () => h(Icon,  {icon: iconName}) })
}

const menuOptions: MenuOption[] = [
    {
        label: 'Labels',
        key: 'labels',
        icon: renderIcon("fluent:arrow-reset-20-filled")
    },
]

const $emit = defineEmits(["transaction", "update:show"]);

const showModel = ref(false)
watch($props.show, () => showModel.value = $props.show.value)
watch(showModel, ()=>{
    $emit("update:show", showModel)
})

const collapsedModel = ref(false)

const menuModel = ref("labels")

</script>

<style scoped>
.card {
    width: 900px;
}

.reset-left-card-margin {
    margin-left: -40px;
}

.settings-content-pane {
    padding-left: 24px;
    margin-top: 2px;
}
</style>
