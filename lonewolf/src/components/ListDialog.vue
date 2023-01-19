<template>
    <n-modal
        v-model:show="showModel"
    >
        <n-card
            class="card"
            title="Modal"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
        >
            <template #header>
                <InitialFocus />
                <TitleInput :title="titleModel" @update:title="emitTitle"/>
            </template>
            <template #header-extra>
            </template>
            Card edit Content
            <template #footer>
                Footer
            </template>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Ref } from "vue";
import InitialFocus from "@/components/InitialFocus.vue";
import TitleInput from "@/components/TitleInput.vue";
import { ListRenameTransaction } from "@/common/data/Transaction";
import type List from "@/common/data/List";
import type Board from "@/common/data/Board";


const $props = defineProps<{
    id: Ref<string>;
    board: () => Board;
    show: Ref<boolean>;
}>();

const $emit = defineEmits(["transaction", "update:show"]);

const emitTitle = (title: string) => $emit("transaction", new ListRenameTransaction($props.id.value, title))

const titleModel = ref("")
const showModel = ref(false)

const reloadList = () => {
    const list =  $props.board().findList($props.id.value);
    if(list != null) setRefs(list)
}

const setRefs = (list: List) => {
    titleModel.value = list.name
}


watch($props.id, ()=>reloadList())
watch($props.show, () => showModel.value = $props.show.value)
watch(showModel, ()=>{
    $emit("update:show", showModel)
    reloadList()
})


</script>

<style scoped>
.card {
    width: 600px;
}

</style>
