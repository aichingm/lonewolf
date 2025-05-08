<template>
    <div
        :id="scrollTargetId"
        class="list"
        :style="'width: ' + ($props.size - 20) + 'px;'"
    >
        <div class="list-name">
            New List
        </div>
        <div class="cards">
            <n-input-group>
                <n-input
                    :id="listNameInputId"
                    ref="listNameInput"
                    v-model:value="listName"
                    placeholder="New List"
                    :theme-overrides="inputThemeOverrides"
                    @keyup.enter="newButtonClicked()"
                />
                <n-button
                    type="primary"
                    tabindex="-1"
                    @click="newButtonClicked()"
                >
                    +
                </n-button>
            </n-input-group>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useThemeVars } from 'naive-ui'
import { themeCast } from '@/themes/theme'
import { v1 as uuid1 } from "uuid";

const listName = ref("");
const listNameInput = ref(null);
const listNameInputId = uuid1();
const scrollTargetId = uuid1();

const $props = withDefaults(defineProps<{
    size?: number;
}>(),{
    size: 270,
});

const $emit = defineEmits(["newList"]);

const inputThemeOverrides = {
    border: '0px solid',
    boxShadowFocus: '0px solid',
}

const theme = themeCast(useThemeVars())


function newButtonClicked() {
    if (listName.value != "") {
        $emit("newList", listName.value);
        listName.value = "";
        nextTick(() => document.getElementById(listNameInputId)?.focus());
        nextTick(() =>
            document
                .getElementById(scrollTargetId)
                ?.scrollIntoView({ inline: "end", behavior: "smooth" })
        );
    }
}
</script>

<style scoped>
.list {
    min-width: 160px;
    background-color: v-bind('theme.listColor');
    display: inline-block;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 4px;
    display: inline-block;
    height: 92px;
}

.list-name {
    padding-top: 7px;
    padding-bottom: 7px;
    font-size: 1.5em;
}

.cards {
    max-height: 430px;
    overflow-y: auto;
}
</style>
