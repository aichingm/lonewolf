<template>
    <div style="height:100%;">
        <n-drawer v-model:show="leftDrawer.state.value" :width="280" placement="left">
            <n-drawer-content title="" body-content-style="margin:0;padding:0;">
                <n-menu :options="leftDrawerMenuOptions" @update:value="leftDrawerMenuClicked" :indent="32" :icon-size="0"/>
            </n-drawer-content>
        </n-drawer>
        <div class="app-header-nav" :style="'border-bottom-color:' + borderColor + ';'">
            <n-space class="app-header-nav-space" justify="space-between">
                <n-button @click="()=>leftDrawer.show(true)" :ghost ="true" :block="true" :bordered="false">
                    <template #icon>
                        <n-icon size="24" color="gray">
                            <icon icon="fluent:panel-left-expand-20-filled" />
                        </n-icon>
                    </template>
                </n-button>
                <n-input v-model:value="searchValue" type="text" placeholder="Search" clearable>
                    <template #prefix>
                        <n-icon color="gray">
                            <icon icon="fluent:search-20-filled" />
                        </n-icon>
                    </template>
                </n-input>
                <n-button quaternary circle style="margin-right: 8px">
                    <template #icon>
                        <n-icon size="18" color="gray">
                            <icon icon="fluent:more-vertical-20-filled" />
                        </n-icon>
                    </template>
                </n-button>
            </n-space>
        </div>
        <router-view v-slot="{ Component }">
            <keep-alive>
                <component :is="Component" />
            </keep-alive>
        </router-view>
        <RouterView name="modal"/>
    </div>
</template>
<script setup lang="ts">
import { RouterView } from "vue-router";
import { ref } from "vue";
import { useThemeVars } from 'naive-ui'
import Board from "@/common/data/Board";


const theme  = useThemeVars();
const borderColor = theme.value.borderColor;

const searchValue = ref();

const leftDrawer = { state: ref(false), show: (bool: boolean) => leftDrawer.state.value = bool}


const leftDrawerMenuOptions = [
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
        label: 'Save as...',
        key: 'save-as',
    },
    {
        key: 'divider-1',
        type: 'divider',
    },
    {
        label: 'Default',
        key: 'default',
    },
]

const board = ref(new Board("foo-bar", "Default"))

const leftDrawerMenuClicked = function (key: string) {
    leftDrawer.show(false)
    switch (key) {
    case "default":
        board.value = Board.fromSerializable(JSON.parse("{}"))
        break;
    case "save":
        board.value = Board.fromSerializable(JSON.parse("{}"))
        break;
    }
}

</script>
<style scoped>
.app-config-wrapper{
    height: calc(100% - 48px);
}
.app-header-nav{
    height: 47px;
    border-bottom: solid 1px;
}
.app-header-nav-space{
    height: 48px;
    align-items: center;
}
.app-board{
    height: calc(100% - 48px);
}

</style>
