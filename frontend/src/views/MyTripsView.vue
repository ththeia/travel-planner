<template>
  <div>
    <div class="tp-toolbar">
      <div>
        <h1 class="tp-page-title">Călătoriile mele</h1>
        <p class="tp-page-subtitle">Gestionează călătoriile și activitățile în carduri.</p>
      </div>

      <div class="tp-toolbar-right">
        <router-link to="/add-trip">
          <button class="tp-btn tp-btn--primary" type="button">Adaugă călătorie</button>
        </router-link>
      </div>
    </div>

    <div v-if="tripStore.loading" class="tp-muted">Se încarcă călătoriile…</div>

    <div v-else-if="tripStore.error" class="tp-error">
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
