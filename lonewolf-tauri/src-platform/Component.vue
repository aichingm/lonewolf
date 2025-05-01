<template>
    <div></div>
</template>
<script setup lang="ts">

import { invoke } from "@tauri-apps/api/core";
import { getMatches } from '@tauri-apps/plugin-cli'
import type { CliMatches } from '@tauri-apps/plugin-cli'


import Board from "@/common/data/Board";
import { Path } from '@/utils/path'
import { read } from './Files'




const $emit = defineEmits([ 'loadBoard' ]);

getMatches().then((matches) => {
    if(matches.subcommand == null) {
        return
    }

    switch(matches.subcommand.name) {
    case 'open':
        open(matches.subcommand.matches)
        break
    }
})

function open(matches: CliMatches) {
    if(
        matches == null ||
        matches.args == null ||
        matches.args.file == null ||
        typeof(matches.args.file.value) != "string"
    ) {
        return
    }

    const fileArg = matches.args.file.value

    const readBoard = (path: string) => {
        read(path).then((b: ArrayBuffer)=>{
            const jsonString = new TextDecoder("utf-8").decode(b)
            const board = Board.fromSerializable(JSON.parse(jsonString))
            board.session.currentPath = path
            $emit("loadBoard", board)
        }).catch(console.log)
    }

    const path = Path.parse(fileArg)

    if (path == null) {
        console.log("Error: failed to parse path: '" + fileArg + "'")
        return
    }

    if (path.isAbsolute()) {
        readBoard(path.toString())
    } else {
        invoke("get_cwd").then((value) => {
            const cwd = value as string
            const cp = Path.parse(cwd)
            if (cp == null) {
                console.log("Error: failed to parse path: '" + fileArg + "'")
                return
            }
            readBoard(path.toAbsolute(cp).toString())
        }).catch(console.log)
    }
}

</script>
<style scoped>
</style>

