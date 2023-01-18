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
                <TitleInput v-model:title="titleModel"/>
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
import type Board from "@/common/data/Board";


const $props = defineProps<{
    id: Ref<string>;
    board: () => Board;
    show: Ref<boolean>;
}>();

const $emit = defineEmits(["transaction", "update:show"]);

// const list = computed(() => $props.board().findList($props.id.value))

const titleModel = ref("")
watch($props.id, ()=>{
    const list =  $props.board().findList($props.id.value);
    if(list != null) {
        titleModel.value = list.name
    }
})
watch(titleModel, ()=>$emit("transaction", new ListRenameTransaction($props.id.value, titleModel.value)))

const showModel = ref(false)
watch($props.show, ()=>showModel.value = $props.show.value)
watch(showModel, ()=>$emit("update:show", showModel))


</script>

<style scoped>
.card {
    width: 600px;
}

</style>
