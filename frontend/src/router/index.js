import { createRouter, createWebHistory } from "vue-router";
import MyTripsView from "@/views/MyTripsView.vue";
import AddTripView from "@/views/AddTripView.vue";

const routes = [
  { path: "/", name: "trips", component: MyTripsView },
  { path: "/add-trip", name: "add-trip", component: AddTripView },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
