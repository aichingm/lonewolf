<template>
    <div class="iconed-box">
        <n-icon
            :color="$props.color"
            :size="$props.iconSize"
            :style="style"
        >
            <Icon :icon="$props.icon" />
        </n-icon>
        <slot class="slot" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const $props = withDefaults(defineProps<{
    icon?: string;
    color?: string;
    iconSize?: number;
    contentOffsetX?: number;
    iconOffsetY?: number;
}>(),{
    icon: "fluent:rename-20-filled",
    color: "gray",
    iconSize: 24,
    contentOffsetX: 0,
    iconOffsetY: 0,
});

const style = computed(()=> ({
    "paddingRight": $props.contentOffsetX + "px",
    "paddingTop": $props.iconOffsetY + "px",

}))

</script>

<style scoped>

.iconed-box {
    display: flex;
    flex-grow: 1;
    margin-right: 2px; /* to make space to the border glow*/
}

.slot {
}

</style>
