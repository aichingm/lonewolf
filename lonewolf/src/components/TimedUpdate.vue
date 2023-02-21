<template>
    <span>{{ text }}</span>
</template>

<script setup lang="ts">

import { watch, ref, onUnmounted } from "vue";

const $props = defineProps<{
    data: unknown,
    text: (data: unknown) => string,
    nextInterval: (data: unknown) => number,
}>();

const $emit = defineEmits(["update"]);
const text = ref("")
let timeoutId: number | null = null

const updateFunc = () => {
    text.value = $props.text($props.data);
    $emit("update")
    timeoutId = window.setTimeout(updateFunc, $props.nextInterval($props.data))
}

text.value = $props.text($props.data)
timeoutId = window.setTimeout(updateFunc, $props.nextInterval($props.data))

watch($props, ()=>{
    text.value = $props.text($props.data)
    if (timeoutId != null) {
        window.clearTimeout(timeoutId as number)
    }
    timeoutId = window.setTimeout(updateFunc, $props.nextInterval($props.data))
})

onUnmounted(()=>{
    if (timeoutId != null) {
        window.clearTimeout(timeoutId as number)
    }
})


</script>
<style scoped>

</style>
