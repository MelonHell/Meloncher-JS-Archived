import Main from "@/renderer/pages/Main.vue";
import Settings from "@/renderer/pages/Settings.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: Main,
  },
  {
    path: "/settings",
    component: Settings,
  }
];

export const router = createRouter({
  routes,
  history: createWebHistory(process.env.BASE_URL),
});
