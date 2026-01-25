<script setup>
import { onMounted, computed } from "vue";
import { useTripStore } from "@/stores/useTripStore";

import TripList from "@/components/trips/TripList.vue";
import TripsForm from "@/components/trips/TripsForm.vue";


const tripStore = useTripStore();

const trips = computed(() => tripStore.trips);
const loading = computed(() => tripStore.loading);
const error = computed(() => tripStore.error);
const selectedTripId = computed(() => tripStore.selectedTripId);

onMounted(() => {
  tripStore.fetchTrips();
});

function onSelectTrip(tripId) {
  tripStore.selectTrip(tripId);
}

async function onCreateTrip(payload) {
  await tripStore.createTrip(payload);
}

async function onDeleteTrip(tripId) {
  await tripStore.deleteTrip(tripId);
}
</script>

<template>
  <div style="max-width: 900px; margin: 0 auto; padding: 16px;">
    <h1>My Trips</h1>

    <TripsForm @create="onCreateTrip" />

    <p v-if="loading">Loading...</p>
    <p v-else-if="error" style="color: red;">{{ error }}</p>

    <TripList
      v-else
      :trips="trips"
      :selectedTripId="selectedTripId"
      @select="onSelectTrip"
      @delete="onDeleteTrip"
    />

    <hr style="margin: 16px 0" />

   
 
  </div>
</template>
