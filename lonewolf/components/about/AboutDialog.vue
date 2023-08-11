<template>
    <n-modal
        v-model:show="showModel"
        class="modal">
        <n-card
            class="card"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
            content-style="padding-left: 32px; padding-right: 32px;"
            title="About"
            footer-style="justify-content: flex-end;display: flex;"
        >
            <n-tabs type="line" animated>
                <n-tab-pane name="Lonewolf" tab="Lonewolf">
                    <div class="lonewolf-layout">
                        <div class="lonewolf-logo"></div>
                        <div class="lonewolf-text-container">
                            <n-h1>Lonewolf<span class="lonewolf-application-version">1.0.0</span></n-h1>
                            <n-p>
                                <n-ul>
                                    <n-li>
                                        <n-a href="https://github.com/aichingm/lonewolf" target="_blank">Github</n-a>
                                    </n-li>
                                </n-ul>
                            </n-p>
                        </div>
                    </div>
                    Created and distrebuted under the terms of the <n-a href="https://spdx.org/licenses/GPL-3.0-or-later.html" target="_blank">GNU General Public License v3.0</n-a>
                </n-tab-pane>
                <n-tab-pane name="Contributors" tab="Contributors">
                    <n-scrollbar class="contributors-container">
                        <n-h1>Core</n-h1>
                        <div class="contributors-grid">
                            <Contributor v-for="c in contributorsCore" :contributor="c" :key="c.name"/>
                        </div>
                        <n-divider class="mb-none"/>
                        <n-h1>Platform</n-h1>
                        <div clas="contributors-grid">
                            <Contributor v-for="c in contributorsPlatform" :contributor="c" :key="c.name"/>
                        </div>
                    </n-scrollbar>
                </n-tab-pane>
                <n-tab-pane name="Third Party" tab="Third Party" class="third-party-licenses-tab">
                    <ThirdPartyLicense v-for="p in thirdPartyLicenses.sort(sortByIname)" :key="p.project" :project="p"/>
                </n-tab-pane>
            </n-tabs>
            <n-divider class="mb-none"/>
            <template #footer>
                <n-button type="primary" @click="showModel = false">
                    Thanks!
                </n-button>
            </template>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">

import { ref, watch } from "vue";
import type { Ref } from "vue";
import contributorsCore from "@/content/contributors";
import contributorsPlatform from "@platform/content/contributors";
import thirdPartyLicenses from "@platform/content/third-party-licenses";

import Contributor from "./Contributor.vue";
import ThirdPartyLicense from "./ThirdPartyLicense.vue";
import type {Project} from '@platform/content/third-party-licenses'



const $props = defineProps<{
    show: Ref<boolean>;
}>();

const $emit = defineEmits(["update:show"]);


const showModel = ref(false)
watch($props.show, ()=>{showModel.value = $props.show.value;})
watch(showModel, ()=>$emit("update:show", showModel))


const sortByIname = (a: Project, b: Project)=>a.project.toLowerCase() < b.project.toLowerCase() ? -1 : 1

</script>

<style scoped>
.modal {
    top:0;
    margin-left: auto;
    margin-right: auto;
    margin-top: 100px;
    margin-bottom: auto;
    height: auto;
}
.card {
    width: 900px;
}

.lonewolf-layout {
    display: flex;
    min-height: 360px;
}

.lonewolf-logo {
    display: inline-block;
    height: 360px;
    mask-image: url('/lonewolf.png');
    width: 360px;
    mask-size:cover;
    background: linear-gradient(45deg, rgba(63,94,251,1) 8%, rgba(252,70,107,1) 68%, rgba(63,94,251,1) 84%);
}

.lonewolf-text-container {
    margin-top: 73px;
}

.lonewolf-application-version {
    font-size: 0.7rem;
    display: inline-block;
    position: absolute;
    margin-top: -5px;
    margin-left: 7px;
}

.contributors-container {
    max-height: calc(100vh - 450px);
}

.contributors-grid {
    display: grid;
    grid-template-columns: 50% 50%;
    justify-items: center;
    grid-row-gap: 10px;
}

.mb-none {
    margin-bottom: 0;
}

.third-party-licenses-tab {
    display: flex;
    flex-direction:column;
    gap: 10px;
}
</style>
