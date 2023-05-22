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
            content-style="padding-left: 32px; padding-right: 32px;display:flex;"
            header-style="padding-left: 32px; padding-right: 32px;"

        >
            <template #header>
                Settings
            </template>
            <n-layout has-sider
                      class="reset-left-card-margin"
            >
                <n-layout-sider class="menu"
                                :native-scrollbar="false"
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
                <n-layout class="content"
                >
                    <LabelsManager v-if="menuModel == 'labels'" :board="$props.board" :labels="$props.labels" @transaction="(t)=>$emit('transaction', t)"/>
                    <BoardManager v-if="menuModel == 'board'" :board="$props.board" @transaction="(t)=>$emit('transaction', t)"/>
                    <ArchiveManager v-if="menuModel == 'archive'"
                                    :board="$props.board"
                                    :labels="$props.labels"
                                    :lists="$props.lists"
                                    :cardArchive="$props.cardArchive"
                                    :listArchive="$props.listArchive"
                                    @transaction="(t)=>$emit('transaction', t)" />
                </n-layout>
            </n-layout>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, h } from "vue";
import type { Ref } from "vue";
import type Board from "@/common/data/Board";
import LabelsManager from "@/components/settings/LabelsManager.vue";
import BoardManager from "@/components/settings/BoardManager.vue";
import ArchiveManager from "@/components/settings/ArchiveManager.vue";
import type { SDLabel, SimpleData, SDList } from "@/common/data/extern/SimpleData";


import { Icon } from "@iconify/vue";
import { NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'

const $props = defineProps<{
    board: () => Board;
    show: Ref<boolean>;
    labels: SDLabel[];
    lists: SDList[];
    cardArchive: SDList;
    listArchive: SDList[];
    settings: SimpleData;

}>();

function renderIcon (iconName: string) {
    return () => h(NIcon, null, { default: () => h(Icon,  {icon: iconName}) })
}

const menuOptions: MenuOption[] = [
    {
        label: 'Board',
        key: 'board',
        icon: renderIcon("fluent:grid-kanban-20-filled")
    },
    {
        label: 'Labels',
        key: 'labels',
        icon: renderIcon("fluent:arrow-reset-20-filled")
    },
    {
        label: 'Archive',
        key: 'archive',
        icon: renderIcon("fluent:archive-20-filled")
    },
]

const $emit = defineEmits(["transaction", "update:show"]);

const showModel = ref(false)
watch($props.show, () => showModel.value = $props.show.value)
watch(showModel, ()=>{
    $emit("update:show", showModel)
})

const collapsedModel = ref(false)

const menuModel = ref(menuOptions[0].key)

</script>

<style scoped>
.card {
    width: 900px;
    height: calc(100vh - 222px);
    min-height: 240px;
}

.menu {
    height: calc(100vh - 322px);
    min-height: 140px;
}

.reset-left-card-margin {
    margin-left: -32px;
}

.content {
    height: calc(100vh - 322px);
    min-height: 140px;
    overflow: hidden;
    padding-left: 24px;
}

.settings-content-pane {
}

</style>
