<template>
    <n-modal v-model:show="showModel" class="component-root">
        <n-card
            class="card"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
            tabindex="0"
        >
            <template #header>
                <InitialFocus />
                <div class="card-reset">
                    <IconedBox icon="fluent:rename-20-filled">
                        <TitleInput :title="titleModel" @update:title="emitTitle" />
                    </IconedBox>
                </div>
            </template>
            <template #header-extra>
            </template>
            <n-scrollbar class="scrollbar scroll-shadow-fixer-outer" >
                <div class="scroll-shadow-fixer-inner">
                    <IconedBox icon="fluent:code-text-20-filled">
                        <Editor v-model:content="descriptionModel" v-model:editMode="editMode.ref" />
                    </IconedBox>
                </div>
            </n-scrollbar>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import Editor from "@/components/editor/Editor.vue";
import { ref, watch } from "vue";
import type { Ref } from "vue";
import InitialFocus from "@/components/InitialFocus.vue";
import IconedBox from "@/components/IconedBox.vue";
import TitleInput from "@/components/TitleInput.vue";
import { CardRenameTransaction, CardDescriptionTransaction } from "@/common/data/Transaction";
import { RefProtector } from "@/utils/vue";
import type Card from "@/common/data/Card";
import type Board from "@/common/data/Board";

const $props = defineProps<{
    id: Ref<string>;
    board: () => Board;
    show: Ref<boolean>;
}>();

const $emit = defineEmits(["transaction", "update:show"]);

const emitTitle = (title: string) => $emit("transaction", new CardRenameTransaction($props.id.value, title))
const emitDescription = (_description: string) => $emit("transaction", new CardDescriptionTransaction($props.id.value, descriptionModel.value))

const titleModel = ref("")
const descriptionModel = ref("")
const showModel = ref(false)
const editMode = new RefProtector(ref(false));

const reloadCard = ()=> {
    const card =  $props.board().findCard($props.id.value);
    if(card != null) setRefs(card)
}

const setRefs = (card: Card)=>{
    titleModel.value = card.name
    descriptionModel.value = card.description
}

watch($props.id, ()=>reloadCard())
watch($props.show, ()=>showModel.value = $props.show.value)
watch(showModel, ()=>{$emit("update:show", showModel); reloadCard()})

watch(descriptionModel, ()=>emitDescription(descriptionModel.value))


</script>
<style scoped>
.component-root {
    height: calc(100% - 60px);
    width: 900px;
    position: fixed;
    top: 30px;
    left: calc(50% - 450px);
}

.card {
    width: 900px;
}

.card-reset{
    margin-left: -40px;
    width: calc(100% + 40px);
}

:deep() .scrollbar{
    max-height: calc(100vh - 222px) !important;
}

:deep() .scroll-shadow-fixer-outer {
    margin-left: -40px;
    width: calc(100% + 40px + 2px);
}

.scroll-shadow-fixer-inner {
    width: calc(100% - 2px);
    padding-top: 2px;
    padding-bottom: 2px;
}


</style>
