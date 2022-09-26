import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/board",
            name: "board",
            // route level code-splitting
            // this generates a separate chunk (BoardView.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import("../views/BoardView.vue"),
        },
        {
            path: "/editor",
            name: "editor",
            // route level code-splitting
            // this generates a separate chunk (CM6View.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import("../views/Editor.vue"),
        },
    ],
});

export default router;
