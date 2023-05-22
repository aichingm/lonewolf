<template>
    <slot v-if="state==0" name="resolving"/>
    <slot v-if="state==1" name="then"  v-bind="{then: then}"/>
    <slot v-if="state==2" name="catch" v-bind="{error: error}"/>
</template>

<script setup lang="ts">

import { ref } from 'vue'
import type { Ref } from 'vue'

const $props = defineProps<{
    promise: Promise<unknown>
}>()

const then = ref(null) as Ref
const error = ref(null)  as Ref
const state = ref(0)

$props.promise.then( arg => {then.value = arg; state.value = 1}).catch(e => {error.value = e; state.value = 1})

</script>
<style scoped>
</style>
