<template>
  <div>
    <h1>Add Trip</h1>

    <TripsForm />

    <!-- Trips List -->
    <div style="margin-top:18px; border:1px solid #ddd; padding:12px; border-radius:8px;">
      <h2 style="margin:0 0 8px;">Listă Trips</h2>

      <div v-if="loading">Se încarcă…</div>
      <div v-else-if="error" style="color:#b00020;">{{ error }}</div>
      <div v-else-if="trips.length === 0" style="color:#666;">Nu sunt activități de afișat.</div>

      <TripList v-else :trips="trips" />
    </div>

  <button @click="goBack" style="margin-top:16px;">
   ← Înapoi
  </button>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import TripsForm from "@/components/trips/TripsForm.vue";
import TripList from "@/components/trips/TripList.vue";
import { useTripStore } from "@/stores/useTripStore";

const router = useRouter();
const tripStore = useTripStore();

const trips = computed(() => tripStore.trips || []);

const loading = ref(false);
const error = ref(null);

function goBack() {
  router.push("/trips");
}

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    await tripStore.fetchTrips();
  } catch (e) {
    error.value = "Failed to load trips";
  } finally {
    loading.value = false;
  }
});
</script>