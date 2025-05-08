<template>
    <div />
</template>
<script setup lang="ts">
import { useDialog } from 'naive-ui'
import { DialogManager } from './Dialogs'

const dialog = useDialog()
DialogManager.initialize(dialog)

// const $emit = defineEmits([ 'loadBoard' ]);

</script>
<style scoped>
</style>

