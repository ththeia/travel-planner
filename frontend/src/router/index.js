import { createRouter, createWebHistory } from "vue-router";

//import LandingView from "@/views/LandingView.vue";
import MyTripsView from "@/views/MyTripsView.vue";
import AddTripView from "@/views/AddTripView.vue";
import AddActivityView from "@/views/AddActivityView.vue";

import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";

const routes = [
  //  când intri pe aplicație -> direct login
  { path: "/", redirect: "/login" },

  // (opțional) dacă vrei să păstrezi landing-ul “frumos”, îl muți pe alt path:

  // trips
  { path: "/trips", name: "trips", component: MyTripsView },
  { path: "/add-trip", name: "add-trip", component: AddTripView },
  {
    path: "/trips/:tripId/add-activity",
    name: "add-activity",
    component: AddActivityView,
  },

  // auth
  { path: "/login", name: "login", component: LoginView },
  { path: "/register", name: "register", component: RegisterView },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
