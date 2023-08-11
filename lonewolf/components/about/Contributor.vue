<template>
    <n-card class="author-card">
        <n-thing>
            <template #avatar>
                <Icon size="40" class="inline-block" :color="hsl($props.contributor.name, $props.contributor.contact)"/>
            </template>
            <template #header>
                {{ $props.contributor.name }}
            </template>
            <template  #description>
                {{ $props.contributor.contact }}
            </template>
            {{ $props.contributor.description }}
            <template  #header-extra>
                <span class="font-sm">{{ $props.contributor.years }}</span>
            </template>
        </n-thing>
    </n-card>
</template>

<script setup lang="ts">
import Icon from '@/components/icons/LonewolfIcon.vue'
import type { Contributor } from '@/content/contributors'

const $props = defineProps<{
    contributor: Contributor;
}>();

function mangle(a: string, b: string) {
    const str1 = a.length < b.length ? b:a;
    const str2 = a.length < b.length ? a:b;
    return [...str1].reduce((acc, char, index) => {
        acc += char + (str2[index] || '');
        return acc;
    }, '');
}

function hash(str: string) {
    let i, l,
        hval = 0x811c9dc5;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return hval >>> 0;
}

function rotate(x: number){
    const order = (""+x).split("")
    const values = (""+x).split("")
    const target = []
    for(const o of order) {
        target.push(values.splice(parseInt(o, 10)%values.length, 1))
    }
    return parseInt(target.join(""), 10)
}

function hsl(name: string, contact: string): string {
    const mangled = mangle(name, contact)
    const hashed = hash(mangled)
    const rotated = rotate(hashed)

    const h = (58 + rotated & 0xFF)%256;
    const s = 40 + ((rotated >> 8) & 0xFF - 32)%60;
    const l = 50 + ((rotated >> 16) & 0xFF)%40;
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
}

</script>
<style scoped>
.author-card {
  max-width: 400px;
}

.inline-block {
    display: inline-block;
}

.font-sm {
    font-size:.7rem
}
</style>
