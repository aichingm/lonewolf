import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        /*{
            path: "/board/:board/card/:card",
            // route level code-splitting
            // this generates a separate chunk (BoardView.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            components: {default:() => import("../views/BoardView.vue"), modal:()=>import("../views/CardDialogView.vue")}
        },
        {
            path: "/board/:board/list/:card",
            // route level code-splitting
            // this generates a separate chunk (BoardView.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            components: {default:() => import("../views/BoardView.vue"), modal:()=>import("../views/ListDialogView.vue")}
        },*/
        {
            path: "/board/:board",
            // route level code-splitting
            // this generates a separate chunk (BoardView.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import("../views/BoardView.vue")
        },
    ],
});

export default router;
