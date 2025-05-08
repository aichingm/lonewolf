<template>
    <n-modal
        v-model:show="showModel"
    >
        <n-card
            class="card"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
        >
            <!--<template #header>
                Settings
            </template>-->
            <n-layout 
                has-sider
                class="reset-left-card-margin modal-background"
            >
                <n-layout-sider
                    class="modal-background"
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
                        v-model:value="menuModel"
                        :collapsed="collapsedModel"
                        :collapsed-width="64"
                        :collapsed-icon-size="22"
                        :options="menuOptions"
                        :default-expand-all="true"
                    />
                </n-layout-sider>
                <div class="content">
                    <n-h3>
                        <n-text depth="3">
                            {{ breadcrumbs }}
                        </n-text>
                    </n-h3>
                    <n-scrollbar class="scroll-content">
                        <LabelsManager
                            v-if="menuModel == 'project/labels'"
                            :project="$props.project"
                            :board="$props.board"
                        />
                        <BoardManager
                            v-if="menuModel == 'project/board'"
                            :project="$props.project"
                            :board="$props.board"
                        />
                        <ArchiveManager
                            v-if="menuModel == 'project/archive'"
                            :project="$props.project"
                            :board="$props.board"
                        />
                        <PreferencesProject
                            v-if="menuModel == 'preferences/project'"
                            :preferences="$props.preferences"
                        />
                        <PreferencesAppearance
                            v-if="menuModel == 'preferences/appearance'"
                            :preferences="$props.preferences"
                        />
                        <SettingsAppearance
                            v-if="menuModel == 'application/appearance'"
                            :app-settings="$props.appSettings"
                        />
                        <SettingsKeymap
                            v-if="menuModel == 'application/keyboard'"
                            :app-settings="$props.appSettings"
                        />
                    </n-scrollbar>
                </div>
            </n-layout>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, watch, h, computed } from "vue";
import type { Ref } from "vue";
import LabelsManager from "@/components/settings/LabelsManager.vue";
import BoardManager from "@/components/settings/BoardManager.vue";
import PreferencesAppearance from "@/components/settings/PreferencesAppearance.vue";
import PreferencesProject from "@/components/settings/PreferencesProject.vue";
import ArchiveManager from "@/components/settings/ArchiveManager.vue";
import SettingsAppearance from "@/components/settings/SettingsAppearance.vue";
import SettingsKeymap from "@/components/settings/SettingsKeymap.vue";
import type { Board as BoardObservable} from "@/common/Observable";
import type Project from "@/common/Project";
import type Preferences from "@/common/settings/Preferences"
import type AppSettings from "@/common/settings/AppSettings"

import Icon from "@/components/icons/Icon.vue";
import { NIcon } from 'naive-ui'

const $props = defineProps<{
    project: Project;
    board: BoardObservable;
    preferences: Preferences;
    show: Ref<boolean>;
    appSettings: AppSettings
}>();

function renderIcon (iconName: string) {
    return () => h(NIcon, null, { default: () => h(Icon,  {icon: iconName}) })
}

const menuOptions = [
    {
        label: 'Project',
        key: 'Project',
        icon: renderIcon("fluent:grid-kanban-20-filled"),
        children: [
            {
                label: 'Board',
                key: 'project/board',
                icon: renderIcon("fluent:grid-kanban-20-filled")
            },
            {
                label: 'Labels',
                key: 'project/labels',
                icon: renderIcon("fluent:arrow-reset-20-filled")
            },
            {
                label: 'Archive',
                key: 'project/archive',
                icon: renderIcon("fluent:archive-20-filled")
            },
        ],
    },
    {
        label: 'Preferences',
        key: 'preferences',
        icon: renderIcon("fluent:options-20-filled"),
        children: [
            {
                label: 'Project',
                key: 'preferences/project',
                icon: renderIcon("fluent:preview-link-20-regular")
            },
            {
                label: 'Appearance',
                key: 'preferences/appearance',
                icon: renderIcon("fluent:view-desktop-20-regular")
            },
        ]
    },
    {
        label: 'Application',
        key: 'application',
        icon: renderIcon("fluent:window-settings-20-filled"),
        children: [
            {
                label: 'Appearance',
                key: 'application/appearance',
                icon: renderIcon("fluent:view-desktop-20-regular")
            },
            {
                label: 'Keyboard',
                key: 'application/keyboard',
                icon: renderIcon("fluent:keyboard-20-regular")
            },
        ]
    },
]

const $emit = defineEmits(["update:show"]);

const showModel = ref(false)
watch($props.show, () => showModel.value = $props.show.value)
watch(showModel, ()=>{
    $emit("update:show", showModel)
})

const collapsedModel = ref(false)

const menuModel = ref(menuOptions[0].children[0].key)

const breadcrumbs = computed(()=>menuModel.value.split('/').map((w)=>w.charAt(0).toUpperCase() + w.slice(1)).join(" / "))

</script>

<style scoped>

.card {
    width: 900px;
}

.reset-left-card-margin {
    margin-left: -32px;
}

.modal-background {
    background-color: var(--modal-color);
}

.content {
    height: max(calc(100dvh - 100px), 390px);
    padding-left: 24px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

:deep() .scroll-content .n-scrollbar-content {
    padding-right: 2px;
}

</style>
