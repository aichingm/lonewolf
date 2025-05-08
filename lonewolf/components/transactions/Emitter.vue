<script setup lang="ts">

import type { Transaction, TransactionTarget } from "@/common/transactions/Transaction";

const $props = defineProps<{
    type: string|string[]|null;
}>();

const $emit = defineEmits(["transaction"]);

defineExpose({
    emitterFunctions: {
        commit: (t: Transaction) => {$emit("transaction", t)},
        filters: (t: Transaction) => {
            if (t == undefined) {
                return true
            }
            
            if (typeof $props.type === 'string'){
                return instanceofChain(t.target, $props.type)
            }
            
            if (Array.isArray($props.type)){
                return $props.type.some((name: string) => instanceofChain(t.target, name))
            }
            
            if ($props.type == null) {
                return true
            } 
             
            return false
        }
    }
})

function instanceofChain(t: TransactionTarget, name: string): boolean {
    return t == name
}

</script>
<template>
    <slot />
</template>
<style>
</style>
