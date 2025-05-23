<template>
    <n-space vertical>
        <InitialFocus />
        <n-space
            v-for="(l, index) in labels"
            :key="l.id"
            class="line"
            justify="space-between"
            align="center"
        >
            <n-space
                inline
                class="line-left"
                justify="start"
                align="center"
            >
                <ColorPicker
                    confirmable
                    :color="nameToHex(l.color)"
                    @confirm="(color)=>onConfirmLabelColorHandler(l, color)"
                >
                    <template #trigger>
                        <div
                            class="color-picker-circle"
                            :style="labelStyle(l.color)"
                        />
                    </template>
                </ColorPicker>
                <TextInput
                    v-model:value="l.name"
                    placeholder="Label Name"
                    saveable
                    resetable
                    commit-on-blur
                    commit-on-enter
                    select-on-edit
                    @update:value="(name)=>onLabelNameChangeHandler(l, name)"
                />
            </n-space>
            <n-space
                justify="end"
                class="actions"
                align="center"
            >
                <n-switch
                    v-model:value="shownSwitches[index].value"
                    @update:value="(v: boolean)=>handleVisibilityChange(v, l, index)"
                >
                    <template #checked>
                        Shown
                    </template>
                    <template #unchecked>
                        Hidden
                    </template>
                </n-switch>
                <n-button-group>
                    <n-popconfirm
                        :show-icon="false"
                        :negative-text="'Delete it'"
                        :positive-text="'Oh, nevermind'"
                        :negative-button-props="{type:'error'}"
                        @negative-click="handleDeleteClick(l, index)"
                    >
                        <template #trigger>
                            <n-button
                                ghost
                                type="error"
                            >
                                <template #icon>
                                    <n-icon>
                                        <icon icon="fluent:delete-20-regular" />
                                    </n-icon>
                                </template>
                            </n-button>
                        </template>
                        Deleting a label will remove it from all cards!
                    </n-popconfirm>
                </n-button-group>
            </n-space>
        </n-space>
        <n-input-group>
            <ColorPicker
                :confirmable="false"
                class="new-label-color-picker"
                :color="nameToHex('black')"
                @update="(value)=>newLabelColor=value"
            >
                <template #trigger>
                    <n-button
                        ghost
                        type="success"
                        :style="newLabelColorButtonStyle"
                    >
                        Pick a Color
                    </n-button>
                </template>
            </ColorPicker>
            <n-input
                v-model:value="newLabelName"
                placeholder="New Label"
            />
            <n-button
                ghost
                type="success"
                @click="emitNewLabel"
            >
                Add
            </n-button>
        </n-input-group>
    </n-space>
</template>


<script setup lang="ts">

import { ref, watch } from "vue";
import type { Ref } from "vue";
import type Project from "@/common/Project";
import type Label from "@/common/data/Label";

import { useTransactions } from '@/components/transactions/api'
import { NewLabelTransaction, DeleteLabelTransaction, LabelChangeTransaction } from "@/common/transactions/LabelTransactions";
import { CardRemoveLabelTransaction } from "@/common/transactions/CardTransactions";

import ColorPicker from "@/components/inputs/ColorPicker.vue";
import TextInput from "@/components/inputs/TextInput.vue";
import InitialFocus from "@/components/InitialFocus.vue";
import { labelStyle, tagColor } from "@/utils/labels";
import { nameToHex } from "@/utils/colors";
import type { Board as BoardObservable } from "@/common/Observable";
import Icon from "@/components/icons/Icon.vue";
import { NIcon } from 'naive-ui'

const $props = defineProps<{
    project: Project;
    board: BoardObservable;
}>();

const transactions = useTransactions()

const newLabelColor = ref("#000000")
const newLabelName = ref("")

function getButtonStyle(light: string, dark: string) {
    return 'border-top-right-radius: unset;border-bottom-right-radius: unset;z-index: 1;' +
        "color: " + dark + " !important;" +
        "background-color:" + light + " !important;" +
        "border-color:" + light + " !important;" +
        "--n-ripple-color: " + dark + ";"+
        "--n-text-color:" + dark + ";"+
        "--n-text-color-hover:" + light + ";" +
        "--n-text-color-pressed:" + light + ";"+
        "--n-text-color-focus:" + light + ";"+
        "--n-text-color-disabled:" + light + ";"+
        "--n-color-target:" + light + ";"+
        "--n-border: 1px solid " + dark + ";"+
        "--n-border-hover: 1px solid " + dark + ";"+
        "--n-border-pressed: 1px solid " + dark + ";"+
        "--n-border-focus: 1px solid " + dark + ";"+
        "--n-border-disabled: 1px solid " + dark + ";"

}

const newLabelColorButtonStyle = ref(getButtonStyle("#ffffff", "#18a058"))

watch(newLabelColor, ()=> {
    const colors = tagColor(newLabelColor.value)
    newLabelColorButtonStyle.value = getButtonStyle(colors.color, colors.textColor)
})

function emitNewLabel() {
    if (newLabelName.value != "") {
        transactions.commit(new NewLabelTransaction(newLabelName.value, newLabelColor.value))
    }

    newLabelColorButtonStyle.value = getButtonStyle("#ffffff", "#18a058")
    newLabelName.value = ""
}

function onConfirmLabelColorHandler(label: Label, color: string) {
    transactions.commit(new LabelChangeTransaction(label.id, 'color', color))
}

function onLabelNameChangeHandler(label: Label, name: string) {
    transactions.commit(new LabelChangeTransaction(label.id, 'name', name))
}

const labels = ref(Array.from($props.project.board.labels.values())) as Ref<Label[]>
const shownSwitches = ref(labels.value.map((label) => ref(label.visibility)))

watch($props.board.labels, ()=>{
    labels.value = Array.from($props.project.board.labels.values())
    shownSwitches.value = labels.value.map((label) => ref(label.visibility))
})

function handleDeleteClick(l: Label, _index: number){
    const board = $props.project.board
    const cards = Array.from(board.cards.values()).filter((c)=>c.labels.find((e)=>e.id == l.id) != undefined);
    cards.forEach((c)=>transactions.commit(new CardRemoveLabelTransaction(c.id, l.id)))
    transactions.commit(new DeleteLabelTransaction(l.id))
}

function handleVisibilityChange(value: boolean, l: Label, _index: number) {
    transactions.commit(new LabelChangeTransaction(l.id, 'visibility', value))
}

</script>
<style scoped>

.line, :deep() .line > div{
    height: 34px;
}

:deep() .line > div:first-child {
    flex-grow: 1;
}

.line-left {
    height: 34px;
    width: 100%
}

:deep() .line-left > div:nth-child(2) {
    flex-grow: 1;
}

.color-picker-circle{
    border-width: 1px;
    border-style: solid;
    border-radius: 100%;
    width: 21px;
    height: 21px;
}

.new-label-color-picker {
    width: unset;
}

</style>
