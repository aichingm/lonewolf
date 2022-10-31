<template>
    <n-modal
        v-model:show="modalShow"
        @afterLeave="back()"
    >
        <n-card
            style="width: 600px"
            title="Modal"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
        >
            <template #header-extra>
                Oops!
            </template>
            Card edit Content
            <template #footer>
                Footer
            </template>
        </n-card>
    </n-modal>
</template>

<script setup lang="ts">

import { useRouter, useRoute } from 'vue-router'
import { ref } from "vue";

const modalShow = ref(true)

const router = useRouter();
const route = useRoute();
const back = () => router.push({path: "/board/" + route.params.board})

</script>

<style scoped>


</style>
