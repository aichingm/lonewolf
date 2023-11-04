#!/usr/bin/env node

import { argv, exit } from 'node:process';
import { opendirSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import https from 'node:https';

function listFiles(paths) {
    const files = []

    for (const path of paths){
        const dir = opendirSync(path, {recursive: true})
        let ent = null;
        while ((ent = dir.readSync()) != null) {
            if (ent.isFile()) {
                files.push(join(ent.path, ent.name))
            }
        }
        dir.closeSync()
    }

    return files
}

function findIconsInFile(path) {
    const re = /fluent:[0-9a-zA-Z-_]*/g
    const contents = readFileSync(path, { encoding: 'utf8' });
    return [...contents.matchAll(re)].map(m=>m[0])
}

async function loadIconPath(iconName) {
    return new Promise((res, rej)=>{
        const httpReq = https.get("https://api.iconify.design/" + iconName.replace(":", "/") + ".svg", {}, httpRes=>{
            const body = []
            httpRes.on('data', (chunk) => body.push(chunk))
            httpRes.on('end', () => {
                const resString = body.join("")
                const path = resString.substring(resString.indexOf(">") + 1, resString.lastIndexOf("<"));
                res(path)
            })
        })

        httpReq.on('error', (err) => {
            rej(err)
        })

        httpReq.on('timeout', () => {
            httpReq.destroy()
            rej(new Error('Request time out'))
        })

        httpReq.end()
    })
}
function missingIconsFromIconsTs(icons) {
    const iconsFile = readFileSync("icons.ts")
    const missingIcons = []
    for (const i of icons) {
        if (!iconsFile.includes("'" + i + "': '")) {
            missingIcons.push(i)
        }
    }
    return missingIcons
}

if (argv[2] == "generate") {
    const files = listFiles(["../components", "../views"])
    const icons = [...new Set(files.map(f=>findIconsInFile(f)).flat())].toSorted()

    if (existsSync("icons.ts") && missingIconsFromIconsTs(icons).length == 0) {
        console.log("icons.ts exists and does not need to be updated")
        exit(0)
    }

    let iconsTS = "const icons: { [key: string]: string; } = {\n"

    for (const i of icons) {
        console.log("Downloading: " + i)
        const path = await loadIconPath(i)
        iconsTS += "   '" + i + "': '" + path + "',\n"
    }
    iconsTS += "};\nexport default icons\n"

    writeFileSync("icons.ts", iconsTS)
    exit(0)

} else if (argv[2] == "check") {
    const files = listFiles(["../components", "../views"])
    const icons = [...new Set(files.map(f=>findIconsInFile(f)).flat())].toSorted()

    const missingIcons = missingIconsFromIconsTs(icons)

    if (missingIcons.length > 0) {
        console.log("Error: missing one or more icons:\n" + missingIcons.map(i => "   * " + i).join("\n"))
        exit(1)
    }

    exit(0)
} else {
    exit(1)
}

