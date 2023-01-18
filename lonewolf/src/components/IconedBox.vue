<template>
    <div class="row">
        <n-icon :color="$props.color" :size="$props.size" :style="style">
            <icon :icon="$props.icon" />
        </n-icon>
        <slot class="slot"></slot>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const $props = withDefaults(defineProps<{
    icon?: string;
    color?: string;
    size?: number;
    paddingTop?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingBottom?: number;
    width?: string;
}>(),{
    icon: "fluent:rename-20-filled",
    color: "gray",
    size: 24,
    paddingTop : 0,
    paddingLeft : 0,
    paddingRight : 0,
    paddingBottom : 0,
    width : "40px",
});

const style = computed(()=> ({
    paddingLeft: $props.paddingLeft + 'px',
    paddingTop: $props.paddingTop + 'px',
    paddingRight: $props.paddingRight + 'px',
    paddingBottom: $props.paddingBottom + 'px',
    width: $props.width
}))

</script>

<style scoped>

.row {
    display: inline-flex;
    width:100%;
}

.slot {
    width: inherit;
}

</style>
