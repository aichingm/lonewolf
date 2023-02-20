<template>
    <n-modal v-model:show="showModel" class="component-root">
        <n-card
            class="card"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
            tabindex="0"
            content-style="padding-left: 32px; padding-right: 32px;"
        >
            <InitialFocus />
            <n-scrollbar class="scrollbar scroll-shadow-fixer-outer" >
                <div class="scroll-shadow-fixer-inner">
                    <n-space vertical>
                        <IconedBox icon="fluent:rename-20-filled" :contentOffsetX="12" :iconOffsetY="8">
                            <TextInput fontSize="20px" v-model:value="titleModel" @update:value="emitTitle" placeholder="Title" commitOnBlur commitOnEnter selectOnEdit/>
                        </IconedBox>
                        <IconedBox icon="fluent:tag-20-filled" :contentOffsetX="24">
                            <LabelSelector :labels="$props.labels" :activeLabels="activeLabels" :board="$props.board" @add="addLabel" @remove="removeLabel"/>
                        </IconedBox>
                        <IconedBox icon="fluent:code-text-20-filled" :contentOffsetX="24">
                            <Editor v-model:content="descriptionModel" v-model:editMode="editMode.ref" />
                        </IconedBox>
                        <div>&nbsp;<!-- this is needed to allow the editor to blur, remove when adding a new iconed box below the editor--></div>
                    </n-space>
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
import TextInput from "@/components/inputs/TextInput.vue";
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
.card {
    width: 900px;
}

:deep() .card .n-card__content {
    padding-left: 32px;
    padding-right: 32px;
}

:deep() .scrollbar{
    height: calc(100vh - 222px) !important;
}

.scroll-shadow-fixer-inner {
    padding-top: 2px;
    padding-bottom: 2px;
}


</style>
