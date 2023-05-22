<template>
    <n-space style="flex-grow: 1;height: 34px;" :wrap-item="false" >
        <div v-if="!editMode" class="text" :style="'margin-top:1px;font-size:' + $props.fontSize + ';'" tabindex="0" @focus="showEdit()">
            <div>{{ textValue }}</div>
        </div>
        <n-input-group v-if="editMode" :style="'width:' + $props.width">
            <n-input :autosize="$props.autosize" :style="'font-size:' + $props.fontSize + ';'" ref="inputRef" @blur="onBlur" type="text" v-model:value="textValue" :placeholder="$props.placeholder" @keyup="handleKeyUp" @keydown="handleKeyDown" />
            <n-button :id="resetButtonId" v-if="$props.resetable" type="default" @click="resetClicked">
                <n-icon size="20">
                    <icon icon="fluent:arrow-reset-20-filled"/>
                </n-icon>
            </n-button>
            <n-button :id="saveButtonId" v-if="$props.saveable" type="primary" @click="saveClicked"  @blur="onBlur">
                <n-icon size="20">
                    <icon icon="fluent:save-20-regular" />
                </n-icon>
            </n-button>
        </n-input-group>
    </n-space>
</template>
<script setup lang="ts">
import { ref, nextTick } from "vue";
import { typeName } from "@/utils/vue";
import type { Ref } from "vue";
import type { NInput } from 'naive-ui';
import { v1 as uuid } from "uuid";

type ValueType = string | object // why the fuck can't I put Ref<string> here?

const $props = withDefaults(defineProps<{
    value: ValueType,
    width?: string,
    placeholder?: string,
    fontSize?: string,
    saveable?: boolean,
    resetable?: boolean,
    commitOnBlur?: boolean,
    commitOnEnter?: boolean,
    exitOnEsc?: boolean,
    selectOnEdit?: boolean,
    autosize?: boolean,
}>(),{
    width: "100%",
    placeholder: "",
    fontSize: "14px",
    saveable: false,
    resetable: false,
    updateOnBlur: true,
    updateOnEnter: true,
    exitOnEsc: true,
    selectOnEdit: false,
    autosize: false,
});

const saveButtonId = uuid()
const resetButtonId = uuid()

const $emit = defineEmits(["update:value"]);

const inputRef = ref(null) as Ref<typeof NInput | null>
const editMode = ref(false)

const valueType = typeName($props.value)
if (! (valueType == "Ref<string>" || valueType == "string")) {
    throw new Error("TextInput expects :value to be string | Ref<string>, got " + valueType)
}

let originalTextValue = ref($props.value).value;
const textValue = ref($props.value);

const commit = function () {
    if (originalTextValue != textValue.value) {
        originalTextValue = textValue.value
        $emit("update:value", textValue.value)
    }
}

const reset = function() {
    textValue.value = originalTextValue
}

const hide = function() {
    editMode.value = false;
}

const onBlur = (e: FocusEvent) => {
    const target = e.relatedTarget as Element | null
    if(target != null && (saveButtonId == target.id || resetButtonId == target.id)){
        e.preventDefault()
        return false
    }

    hide()

    if ($props.commitOnBlur) {
        commit()
    }
}

const showEdit = () => {
    editMode.value = true;
    //nextTick(()=>inputRef.value.select())
    nextTick(() => {
        if(inputRef.value != null){
            inputRef.value.focus()
            if ($props.selectOnEdit) {
                inputRef.value.select()
            }
        }
    }) // have to use nextTick since v-if only creates and updates the ref after the component is created, which happens at the end of this tick
}

const saveClicked = (_e: Event) => {
    hide()
    commit()
}

const resetClicked = (_e: Event) => {
    reset()
    nextTick(() => {
        if(inputRef.value != null){inputRef.value.focus()}
    })
}

const handleKeyUp = function(e: KeyboardEvent) {
    if ($props.commitOnEnter && e.keyCode == 13) {
        hide()
        commit()
    }
    if ($props.exitOnEsc && e.keyCode == 27) {
        reset()
        hide()
    }
}

const handleKeyDown = function(e: KeyboardEvent) {
    if (e.keyCode == 27) {
        e.preventDefault()
        e.stopPropagation()
        return false
    }
}

defineExpose({ inputRef })

</script>
<style scoped>
.text {
    margin-left: 12px;
    height: 100%;
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
}
</style>
