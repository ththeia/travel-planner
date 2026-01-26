import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style/app.css"



import { useAuthStore } from "@/stores/useAuthStore";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// pornește listener-ul Firebase Auth (user logat / delogat)
useAuthStore().init();

app.mount("#app");
