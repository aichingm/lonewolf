<template>
    <n-space align="center">
        <Async v-for="attachment in $props.attachments.filter(a=>!a.deleted)" :key="attachment.id"
               :promise="$props.board().attachmentStore().url(attachment.location)"
        ><template  #then="{then}">
            <AttachmentActions class="block" :attachment="attachment" :url="then!=null?then:''" @delete="(id)=>$emit('delete', id)">
                <n-button
                    text
                    tag="a"
                    :href="then"
                    target="_blank"
                    type="primary"
                    class="block"
                    style="height:28px;"
                >
                    {{attachment.name}}
                </n-button>
            </AttachmentActions>
        </template></Async>
        <n-button dashed style="height: 28px;" @click="handleNewAttachmentClick">+</n-button>
    </n-space>
</template>

<script setup lang="ts">

import Async from "@/components/Async.vue";
import AttachmentActions from "./AttachmentActions.vue";
import { AttachmentMeta } from "@/common/attachments/Store";
import type { Location } from "@/common/attachments/Store";
import type CardAttachment from "@/common/data/CardAttachment";
import type Board from "@/common/data/Board";



const $props = defineProps<{
    attachments: CardAttachment[]
    board: ()=> Board
}>()

const $emit = defineEmits(["add", "delete"]);


function handleNewAttachmentClick(){
    const input = document.createElement('input');
    input.type = "file"
    input.click();

    input.addEventListener('change', (e)=>{
        const target = e.target as HTMLInputElement
        if (target == null || target.files == null) {
            return
        }
        const file = target.files[0]

        const reader = new FileReader();
        reader.onload = function(e) {
            const target = e.target
            if(target != null && target.result != null && $props.board().attachmentStore()){
                const store = $props.board().attachmentStore()
                const meta = new AttachmentMeta()
                meta.name = file.name
                meta.mime = file.type
                store.createLocation(meta).then((location: Location)=>{
                    store.pushData(location, target.result as ArrayBuffer) // this can be said because we use readAsArrayBuffer
                    $emit("add", location, file.name, file.type)
                })
            }
        };
        reader.readAsArrayBuffer(file); // NOTICE if this is changed the type anontation has to change too!!
    }, false);

}

</script>
<style scoped>
</style>
