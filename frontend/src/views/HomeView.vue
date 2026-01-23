<script setup>
import { onMounted } from "vue";
import { useTripStore } from "../stores/useTripStore";

const tripStore = useTripStore();

onMounted(() => {
  tripStore.fetchTrips();
});
</script>

<template>
  <div style="padding: 16px">
   <h1>My Trips</h1>

    <p v-if="tripStore.loading">Loading trips...</p>
    <p v-else-if="tripStore.error">Error: {{ tripStore.error }}</p>

    <ul v-else>
      <li v-for="trip in tripStore.trips" :key="trip.id">
        <strong>{{ trip.country || "(no country)" }}</strong>
        — {{ trip.date || "(no date)" }}
        — Budget: {{ trip.budget ?? 0 }}
      </li>
    </ul>

    <p v-if="!tripStore.loading && !tripStore.error && tripStore.trips.length === 0">
      No trips found.
    </p>
  </div>
</template>
