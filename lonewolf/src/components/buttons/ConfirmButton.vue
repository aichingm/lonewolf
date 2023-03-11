<template>
    <div>
        <n-button
            v-if="state == 'normal'"
            v-bind="$props.buttonProps"
            :class="$props.buttonClass"
            @click="handleClick"
        >
            <slot name="button">Delete</slot>
        </n-button>
        <n-tooltip
            v-if="state == 'expectingConfirmation'"
            trigger="hover"
            :disabled="state != 'expectingConfirmation'"
        >
            <template #trigger>
                <n-button
                    v-bind="$props.confirmProps"
                    :class="$props.confirmClass"
                    @click="handleClick"
                >
                    <slot name="confirm">Sure?</slot>
                    <n-progress
                        class="ConfirmButton-93f669de-1722-4776-bc40-07b2c79e1936"
                        style="width: 28px;height:28px;"
                        type="circle"
                        :show-indicator="false"
                        status="error"
                        :percentage="timerValue"
                        :stroke-width="15"
                        :offset-degree="180"
                    />
                </n-button>
            </template>
            <slot name="confirmTooltip">Click to confirm!</slot>
        </n-tooltip>
    </div>
</template>
<script setup lang="ts">

import { ref } from "vue";
import type { Ref } from "vue";
import Overtime, { viaEaseOutQuad } from "@/lib/overtime";

import type { ButtonProps } from 'naive-ui';

const $props = withDefaults(defineProps<{
    buttonProps: ButtonProps
    buttonClass?: string
    confirmProps: ButtonProps
    confirmClass?: string
}>(),{
    buttonClass: "",
    confirmClass: ""
})

type State = "normal" | "expectingConfirmation"

const state = ref("normal") as Ref<State>;

const $emit = defineEmits(["confirm", "click", "timedout"]);

const timerValue = ref(100)

const timedOut = ()=> {
    state.value = "normal"
    timerValue.value = 100
    $emit("timedout")
}

const o = new Overtime<string>().duration(5000).from(100).to(0).via(viaEaseOutQuad).tick((value, progress)=>{
    timerValue.value=value;
    if(progress == 1){
        timedOut()
    }
    return true;
})

function handleClick(){
    switch(state.value){
    case "normal":
        $emit("click")
        state.value = "expectingConfirmation"
        o.run()

        break;
    case "expectingConfirmation":
        $emit("confirm")
        state.value = "normal"
        timerValue.value = 100
        o.cancel()
        break;
    }
}

</script>
<style scoped>

:deep(.ConfirmButton-93f669de-1722-4776-bc40-07b2c79e1936.n-progress .n-progress-graph .n-progress-graph-circle .n-progress-graph-circle-fill) {
    transition: unset !important;
}
</style>
