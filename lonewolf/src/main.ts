import { createApp } from "vue";
import { createPinia } from "pinia";

import naiveUI from "naive-ui";

// General Font
import "vfonts/Lato.css";
// Monospace Font
import "vfonts/FiraCode.css";

import { Icon } from "@iconify/vue";


import App from "./App.vue";
import router from "./router";

import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(naiveUI);

app.component("Icon", Icon);

app.mount("#app");
