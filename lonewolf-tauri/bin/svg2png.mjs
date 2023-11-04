#!/usr/bin/env node

import { argv, exit } from 'node:process';

let sharpModule = null

try {
    sharpModule = await import('sharp')
} catch (err) {
    console.log(err)
    if (err.code == "ERR_MODULE_NOT_FOUND") {
        console.log("Error: Missing module sharp, install with `npm install --no-save sharp`")
        exit(1)
    } else {
        console.log(err.code)
    }
}


let background = null
let src = null
let dest = null
let width = null
let height = null


const parameters = argv.slice(2)

while (parameters.length > 0) {
    const curr = parameters.shift()
    switch (curr) {
    case '-b':
        background = parameters.shift()
        break
    case '--output':
        dest = parameters.shift()
        break
    case '--width':
        width = parseInt(parameters.shift())
        break
    case '--height':
        height = parseInt(parameters.shift())
        break
    default:
        src = curr
        break
    }
}

sharpModule.default(src)
    .resize(width, height)
    .composite([{blend: "multiply", input:{create: {height: height, width:width, channels: 4, background: background}}}])
    .png()
    .toFile(dest)

