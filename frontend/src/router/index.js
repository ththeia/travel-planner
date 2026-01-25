import { createRouter, createWebHistory } from "vue-router";
import MyTripsView from "@/views/MyTripsView.vue";
import AddTripView from "@/views/AddTripView.vue";
import AddActivityView from "@/views/AddActivityView.vue";


const routes = [
  { path: "/", name: "trips", component: MyTripsView },
  { path: "/add-trip", name: "add-trip", component: AddTripView },
  { path: "/trips/:tripId/add-activity", name: "add-activity", component: AddActivityView },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
