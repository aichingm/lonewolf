<template>
    <n-tooltip placement="bottom" trigger="hover">
        <template #trigger>
            <div class="badge" :style="style"></div>
        </template>
        <span> {{ $props.name }} </span>
    </n-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const $props = defineProps<{
    name: string;
    color: string;
    borderColor: string;
}>();

const style = computed(()=>"background-color:" + $props.color + ";")


</script>
<style scoped>

.badge {
  height: 8px;
  width: 40px;
  border-radius: 4px;
  margin-right: 4px;
  margin-bottom: 4px;
  min-width: 1px;
}

</style>
