<template>
    <div class="icon" :style="style"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const $props = withDefaults(defineProps<{
    size?: string|number;
    color?: string;
}>(),{
    size: 48,
    color: "",
});


const style = computed(()=>({
    height: toPx($props.size),
    width: toPx($props.size),
    backgroundColor: $props.color
}))

function toPx(value: string|number){
    return typeof value === "number" || value.match(/.*[0-9]$/)? value+"px": value;
}

</script>
<style scoped>
.icon{
    mask-image: url(/icon.png);
    mask-size: cover;
}
</style>
