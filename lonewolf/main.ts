import { createApp } from "vue";

import naiveUI from "naive-ui";

// General Font
import "vfonts/Lato.css";
// Monospace Font
import "vfonts/FiraCode.css";

import "github-markdown-css/github-markdown.css"

import Icon from "./components/icons/Icon.vue";

import Codemirror from 'vue-codemirror'

import App from "./App.vue";

import "./assets/main.css";


const app = createApp(App);

app.use(naiveUI);

app.component("Icon", Icon);

// setup VueCodemirror to not use any default extensions
app.use(Codemirror, {extensions: []})

app.mount("#app");
