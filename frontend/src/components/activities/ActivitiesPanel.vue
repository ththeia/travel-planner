<template>
  <section style="border:1px solid #ddd; padding:12px; border-radius:8px;">
    <h2 style="margin:0 0 8px;">Activities</h2>

    <!-- dacă nu avem trip selectat, nu randam form/list -->
    <div v-if="!tripId" style="color:#666;">
      Select a trip to see activities.
    </div>

    <template v-else>
      <ActivityForm :tripId="tripId" @create="handleCreate" />

      <div v-if="loading" style="margin-top:8px;">Loading activities…</div>
      <div v-else-if="error" style="margin-top:8px; color:#b00020;">{{ error }}</div>
      <div v-else-if="activities.length === 0" style="margin-top:8px; color:#666;">
        No activities yet.
      </div>

      <ActivityList
        v-else
        :tripId="tripId"
        :activities="activities"
        @delete="handleDelete"
      />
    </template>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useTripStore } from "@/stores/useTripStore";

import ActivityForm from "./ActivityForm.vue";
import ActivityList from "./ActivityList.vue";

const props = defineProps({
  // NU required. Uneori e null până se încarcă trips / până selectezi
  tripId: { type: String, default: null },
});

const tripStore = useTripStore();

const activities = computed(() => {
  if (!props.tripId) return [];
  const map = tripStore.activitiesByTripId || {};
  return map[props.tripId] || [];
});

const loading = computed(() => {
  if (!props.tripId) return false;
  const map = tripStore.activitiesLoadingByTripId || {};
  return !!map[props.tripId];
});

const error = computed(() => {
  if (!props.tripId) return null;
  const map = tripStore.activitiesErrorByTripId || {};
  return map[props.tripId] || null;
});

async function handleCreate(payload) {
  await tripStore.createActivity(props.tripId, payload);
}

async function handleDelete(activityId) {
  await tripStore.deleteActivity(props.tripId, activityId);
}
</script>
