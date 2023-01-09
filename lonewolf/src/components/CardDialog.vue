<template>
    <n-modal
        v-model:show="showModel"
        style="height: calc(100% - 60px); width: 900px; position: fixed; top: 30px;left: calc(50% - 450px);"
    >
        <n-card
            style="width: 900px"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
            tabindex="0"
        >
            <template #header>
                <InitialFocus />
                <TitleInput v-model:title="titleModel"/>
            </template>
            <template #header-extra>
            </template>
            <n-scrollbar style="max-height: calc(100vh - 222px);">
                <Editor v-model:content="descriptionModel" v-model:editMode="editMode.ref" />
            </n-scrollbar>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import Editor from "@/components/editor/Editor.vue";
import { ref, watch } from "vue";
import type { Ref } from "vue";
import InitialFocus from "@/components/InitialFocus.vue";
import TitleInput from "@/components/TitleInput.vue";
import { CardRenameTransaction, CardDescriptionTransaction } from "@/common/data/Transaction";
import { RefProtector } from "@/utils/vue";
import type Board from "@/common/data/Board";

const $props = defineProps<{
    id: Ref<string>;
    board: () => Board;
    show: Ref<boolean>;
}>();

const $emit = defineEmits(["transaction", "update:show"]);

//const card = computed(() => $props.board().findCard($props.id.value))

const titleModel = ref("")
const descriptionModel = ref("")

watch($props.id, ()=>{
    const card =  $props.board().findCard($props.id.value);
    if(card != null) {
        titleModel.value = card.name
        descriptionModel.value = card.description
    }
})
watch(titleModel, ()=>$emit("transaction", new CardRenameTransaction($props.id.value, titleModel.value)))


const showModel = ref(false)
watch($props.show, ()=>showModel.value = $props.show.value)
watch(showModel, ()=>$emit("update:show", showModel))


watch(descriptionModel, ()=>$emit("transaction", new CardDescriptionTransaction($props.id.value, descriptionModel.value)))

const editMode = new RefProtector(ref(false));

</script>
<style scoped>


</style>
