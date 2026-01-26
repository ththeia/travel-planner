<template>
  <div>
    <div class="tp-toolbar">
      <div>
        <h1 class="tp-page-title">Adaugă călătorie</h1>
        <p class="tp-page-subtitle">Completează detaliile și salvează.</p>
      </div>

      <div class="tp-toolbar-right">
        <button class="tp-btn" type="button" @click="goBack">← Înapoi</button>
      </div>
    </div>

    <TripsForm />

    <!-- Trips List -->
    <div class="tp-card" style="margin-top: 16px;">
      <h2 style="margin: 0 0 10px; font-weight: 900;">Călătoriile existente</h2>

      <div v-if="loading" class="tp-muted">Se încarcă…</div>
      <div v-else-if="error" class="tp-error">{{ error }}</div>
      <div v-else-if="trips.length === 0" class="tp-muted">Nu există călătorii de afișat.</div>

      <TripList v-else :trips="trips" />
    </div>
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

const loading = computed(() => tripStore.loading);
const error = computed(() => tripStore.error);
const trips = computed(() => tripStore.trips);

onMounted(() => {
  tripStore.fetchTrips();
});

function goBack() {
  router.push("/trips");
}
</script>
