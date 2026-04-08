import { createRouter, createWebHashHistory } from "vue-router";
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/:catchAll(.*)",
      name: "404",
      meta: {
        title: "404",
      },
      component: () => import("@/pages/error/404.vue"),
    },
    {
      path: "/",
      redirect: "/workbench",
    },
    {
      path: "/workbench",
      component: () => import("@/pages/workbench/index.vue"),
      redirect: "/project",
      children: [
        {
          path: "/project",
          component: () => import("@/views/project/index.vue"),
        },
        {
          path: "/projectDetail",
          component: () => import("@/views/projectDetail/index.vue"),
        },
        {
          path: "/setting",
          component: () => import("@/views/setting/index.vue"),
        },
        {
          path: "/taskList",
          component: () => import("@/views/taskList/index.vue"),
        },
      ],
    },
    {
      path: "/login",
      component: () => import("@/pages/login/index.vue"),
    },
  ],
});
router.beforeEach((to) => {
  const hasToken = Boolean(localStorage.getItem("token"));

  if (to.path === "/login") {
    return hasToken ? "/project" : true;
  }

  return hasToken ? true : "/login";
});
export default router;
