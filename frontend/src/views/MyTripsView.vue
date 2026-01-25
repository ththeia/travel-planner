<template>
  <div>
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h1>My Trips</h1>

      <router-link to="/add-trip">
        <button>Add Trip</button>
      </router-link>
    </div>

    <div v-if="tripStore.loading">Loading trips…</div>

    <div v-else-if="tripStore.error" style="color:#b00020;">
      {{ tripStore.error }}
    </div>

    <div v-else>
      <TripList :trips="tripStore.trips" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import TripList from "@/components/trips/TripList.vue";
import { useTripStore } from "@/stores/useTripStore";

const tripStore = useTripStore();

onMounted(() => {
  tripStore.fetchTrips();
});
</script>
