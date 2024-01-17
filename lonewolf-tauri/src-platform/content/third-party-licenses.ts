type License = "MIT" | "BSD-3-Clause" | "GPL-3.0-or-later" | "Apache-2.0" | "OFL-1.1";

export type Project = {
    project: string,
    license: License,
    url: string,
    repository: string
};

const content: Project[] = [
    {
        project: "Naive UI",
        license: "MIT",
        url: "https://www.naiveui.com",
        repository: "https://github.com/tusen-ai/naive-ui",
    },
    {
        project: "CodeMirror",
        license: "MIT",
        url: "https://codemirror.net",
        repository: "https://github.com/codemirror/dev",
    },
    {
        project: "Tauri",
        license: "MIT",
        url: "https://tauri.app/",
        repository: "https://github.com/tauri-apps/tauri",
    },
    {
        project: "Tauri Plugins",
        license: "MIT",
        url: "https://tauri.app/",
        repository: "https://github.com/tauri-apps/plugins-workspace",
    },
    {
        project: "Fira Code",
        license: "OFL-1.1",
        url: "https://fonts.google.com/specimen/Fira+Code/about",
        repository: "https://github.com/tonsky/FiraCode",
    },
    {
        project: "Lato",
        license: "OFL-1.1",
        url: "https://www.latofonts.com",
        repository: "https://github.com/latofonts/lato-source",
    },
    {
        project: "Noto Color Emoji",
        license: "OFL-1.1",
        url: "https://fonts.google.com/noto/specimen/Noto+Color+Emoji",
        repository: "https://github.com/googlefonts/noto-emoji",
    },
    {
        project: "Fluent UI System Icons",
        license: "MIT",
        url: "https://aka.ms/fluentui-system-icons",
        repository: "https://github.com/microsoft/fluentui-system-icons",
    },
    {
        project: "Day.js",
        license: "MIT",
        url: "https://day.js.org",
        repository: "https://github.com/iamkun/dayjs",
    },
    {
        project: "DOMPurify",
        license: "Apache-2.0",
        url: "https://cure53.de/purify",
        repository: "https://github.com/cure53/DOMPurify",
    },
    {
        project: "emoji-name-map",
        license: "MIT",
        url: "https://github.com/IonicaBizau/emoji-name-map",
        repository: "https://github.com/IonicaBizau/emoji-name-map",
    },
    {
        project: "github-markdown-css",
        license: "MIT",
        url: "https://sindresorhus.com/github-markdown-css",
        repository: "https://github.com/sindresorhus/github-markdown-css",
    },
    {
        project: "marked",
        license: "MIT",
        url: "https://marked.js.org",
        repository: "https://github.com/markedjs/marked",
    },
    {
        project: "uuid",
        license: "MIT",
        url: "https://github.com/uuidjs/uuid",
        repository: "https://github.com/uuidjs/uuid",
    },
    {
        project: "Vue.js",
        license: "MIT",
        url: "https://vuejs.org/",
        repository: "https://github.com/vuejs/core",
    },
    {
        project: "vue-codemirror ",
        license: "MIT",
        url: "https://github.surmon.me/vue-codemirror",
        repository: "https://github.com/surmon-china/vue-codemirror",
    },
    {
        project: "Vue.Draggable",
        license: "MIT",
        url: "https://sortablejs.github.io/Vue.Draggable",
        repository: "https://github.com/SortableJS/Vue.Draggable",
    },
];

export default content
