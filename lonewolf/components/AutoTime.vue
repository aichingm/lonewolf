<template>
    <n-tooltip trigger="hover">
        <template #trigger>
            {{ text }}
        </template>
        {{ dayjs($props.data).utc(true).tz(dayjs.tz.guess()) }}
    </n-tooltip>
</template>

<script setup lang="ts">

import { watch, ref, onUnmounted } from "vue";

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

const $props = defineProps<{
    data: number,
}>();

const $emit = defineEmits(["update"]);
const text = ref("")
let timeoutId: number | null = null



function nextInterval(data: number) {
    const now = dayjs().unix() * 1000
    const diff = (now - data) / 1000
    let interval = 0

    if (diff < -2*60*60) { // in less than 2 hours
        interval = 60*15*1000 // 15 mins
    } else if(diff < -60*60) { // in less than 1 hours
        interval = 6000 // 1 min
    } else if(diff < -2*60) { // in less than 2 mins
        interval = 1* 1000 // 1 sec
    } else if (diff < 60) {
        interval = 10*1000 // 10 secs
    } else if (diff < 3600) { // less that an hour
        interval = 60*1000 // 1 min
    } else if (diff < 60*60*24) { // less than a day
        interval = 60*15*1000 // 15 mins
    }else {
        interval = 60*60*1000 // 1 day
    }

    return interval
}

const updateFunc = () => {
    text.value = dayjs($props.data).fromNow()
    $emit("update")
    timeoutId = window.setTimeout(updateFunc, nextInterval($props.data))
}

text.value = dayjs($props.data).fromNow()
timeoutId = window.setTimeout(updateFunc, nextInterval($props.data))

watch($props, ()=>{
    text.value = dayjs($props.data).fromNow()
    if (timeoutId != null) {
        window.clearTimeout(timeoutId as number)
    }
    timeoutId = window.setTimeout(updateFunc, nextInterval($props.data))
})

onUnmounted(()=>{
    if (timeoutId != null) {
        window.clearTimeout(timeoutId as number)
    }
})


</script>
<style scoped>

</style>
