<template>
    <div class="list">
        <n-input
            ref="inputRef"
            v-model:value="filter"
            class="input"
            autofocus
            placeholder="Filter"
            clearable
            @keyup="handleKey"
            @keydown="handleKeyDown"
            @blur="handleBlur"
        />
        <div class="tags">
            <div
                v-for="(o, index) of options"
                :key="o.id"
                :class="'tag-line ' + (index==active?'tag-line-active':'')"
            >
                <n-tag
                    :color="tagColor(o.color)"
                    tabindex="-1"
                    @click="optionClicked(o)"
                >
                    {{ o.name }}
                </n-tag>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from "vue";
import { tagColor } from "@/utils/labels";
import type { InputInst } from 'naive-ui'

export type Option = {id: string, name: string, color: string}
export type Options = Option[];

const $props = defineProps<{
    options: Options
}>();

const $emit = defineEmits(["selected", "remove", "blur"]);

const inputRef = ref<InputInst | null>(null)

nextTick(()=>inputRef.value?.focus())

const filter = ref("")

const options = computed(()=>$props.options.filter(o=>o.name.toLowerCase().includes(filter.value.toLowerCase())))

const active = ref(0)

watch(options, ()=> active.value = Math.max(Math.min(active.value, options.value.length-1), 0))

function handleKey(e: KeyboardEvent) {
    switch(e.keyCode) {
    case 38:
        active.value = Math.max(active.value - 1, 0)
        break
    case 40:
        active.value = Math.min(active.value + 1, options.value.length-1)
        break
    case 13:
        if (options.value.length > 0)
            $emit("selected", options.value[active.value].id)
        active.value = Math.max(Math.min(active.value, options.value.length-1), 0)
        filter.value = ""
        break
    }
    nextTick(() =>
        document.querySelector(".tag-line-active")
            ?.scrollIntoView({ inline: "end", behavior: "smooth" })
    );
}

function handleKeyDown(e: KeyboardEvent) {
    switch(e.keyCode) {
    case 27:
        e.preventDefault()
        e.stopPropagation()
        $emit("blur")
        break
    }
}

function optionClicked (option: Option) {
    $emit("selected", option.id)
}

function handleBlur (e: FocusEvent) {
    const t = e.relatedTarget as Element | null
    if (t != null && isChildOfTags(t)) {
        setTimeout(()=>inputRef.value?.focus(), 0)
        e.preventDefault()
        return false
    }
    $emit("blur")
}

function isChildOfTags(n: Node): boolean {
    if (n instanceof Element && n.classList.contains("tag-line")) {
        return true
    }
    if (n.parentNode == null) {
        return false
    }
    return n.parentNode == undefined ? false : isChildOfTags(n.parentNode);
}



defineExpose({ inputRef })

</script>

<style scoped>
.input{
    margin-top:5px;
}

.tag-line {
  padding:5px;
  border-radius: 5px;
  margin-bottom:5px;
  margin-top:5px;
}

.tag-line:hover {
  background-color: var(--n-border-color);
}

.tag-line-active {
  background-color: var(--n-border-color);
}

:deep() .tag-line .n-tag {
    width: 100%;
}

.tags {
  max-height: 150px;
  overflow-y: scroll;
  margin-top: 10px;
}

</style>
