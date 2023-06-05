<template>
    <n-space align="center">
        <Async v-for="attachment in $props.attachments.filter(a=>!a.deleted)" :key="attachment.id"
               :promise="$props.board().attachmentStore().url(attachment.location)"
        ><template  #then="{then}">
            <AttachmentActions class="block" :board="$props.board" :attachment="attachment" :url="then!=null?then:''" @delete="(id)=>$emit('delete', id)" @edit="(id, location, name, mime)=>$emit('edit', id, location, name, mime)" />
        </template></Async>
        <n-button dashed style="height: 28px;" @click="handleNewAttachmentClick">+</n-button>
    </n-space>
</template>

<script setup lang="ts">

import Async from "@/components/Async.vue";
import AttachmentActions from "./AttachmentActions.vue";
import type CardAttachment from "@/common/data/CardAttachment";
import type Board from "@/common/data/Board";
import type {Location, Attachment} from "@/common/attachments/Store";



const $props = defineProps<{
    attachments: CardAttachment[]
    board: ()=> Board
}>()

const $emit = defineEmits(["add", "delete", "edit"]);


function handleNewAttachmentClick(){
    $props.board().attachmentStore().chooseAttachment().then((data: [Location, Attachment])=> $emit("add", data[0], data[1].name, data[1].mime))
}

</script>
<style scoped>
</style>
