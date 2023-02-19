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
                    <IconedBox icon="fluent:tag-20-filled" class="IconedBox">
                        <div class="iconed-box-content-wrapper">
                            <LabelSelector :labels="$props.labels" :activeLabels="activeLabels" :board="$props.board" @add="addLabel" @remove="removeLabel"/>
                        </div>
                    </IconedBox>
                    <IconedBox icon="fluent:code-text-20-filled" class="IconedBox">
                        <div class="iconed-box-content-wrapper">
                            <Editor v-model:content="descriptionModel" v-model:editMode="editMode.ref" />
                        </div>
                    </IconedBox>
                </div>
            </n-scrollbar>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import Editor from "@/components/editor/Editor.vue";
import LabelSelector from "@/components/labels/LabelSelector.vue";
import { ref, watch, computed } from "vue";
import type { Ref } from "vue";
import InitialFocus from "@/components/InitialFocus.vue";
import IconedBox from "@/components/IconedBox.vue";
import TitleInput from "@/components/TitleInput.vue";
import { CardRenameTransaction, CardDescriptionTransaction, CardAddLabelTransaction, CardRemoveLabelTransaction } from "@/common/data/Transaction";
import { RefProtector } from "@/utils/vue";
import type Card from "@/common/data/Card";
import type Board from "@/common/data/Board";
import type { SDCardHolder, SDLabel } from "@/common/data/extern/SimpleData";


const $props = defineProps<{
    cardHolder: SDCardHolder;
    board: () => Board;
    show: Ref<boolean>;
    labels: SDLabel[];
}>();

const $emit = defineEmits(["transaction", "update:show"]);

const emitTitle = (title: string) => $emit("transaction", new CardRenameTransaction($props.cardHolder.card.id, title))

const card = computed(()=>{$props.cardHolder.card.version; return $props.board().findCard($props.cardHolder.card.id)})

watch($props.cardHolder, ()=>{if(card.value!= null) setRefs(card.value)})

const activeLabels = computed(() => {
    if (card.value != null) {
        return card.value.labels.filter(l=>l.visibility);
    }
    return [];
})

const titleModel = ref(card.value!=null?card.value.name:"")
let descriptionOriginal = card.value!=null?card.value.description:""
const descriptionModel = ref(card.value!=null?card.value.description:"")

const setRefs = (card: Card)=>{
    titleModel.value = card.name
    descriptionOriginal = card.description
    descriptionModel.value = card.description
}

watch(descriptionModel, ()=>{
    if (descriptionModel.value != descriptionOriginal) {
        $emit("transaction", new CardDescriptionTransaction($props.cardHolder.card.id, descriptionModel.value))
    }
})

const showModel = ref(true)
watch($props.show, ()=>{showModel.value = $props.show.value;})
watch(showModel, ()=>$emit("update:show", showModel))

const editMode = new RefProtector(ref(false));




function addLabel(labelId: string) {
    $emit("transaction", new CardAddLabelTransaction($props.cardHolder.card.id, labelId))
}

function removeLabel(labelId: string) {
    $emit("transaction", new CardRemoveLabelTransaction($props.cardHolder.card.id, labelId))
}

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

.IconedBox {
    margin-bottom: 28px;
}
.iconed-box-content-wrapper {
    border-top: 1px solid #e4e4e4;
    width:100%;
    padding-top: 28px;
}
</style>
