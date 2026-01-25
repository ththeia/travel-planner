<template>
  <section style="border:1px solid #ddd; padding:12px; border-radius:8px;">
    <h2 style="margin:0 0 8px;">Activities</h2>

    <div v-if="!tripId" style="color:#666;">
      Select a trip to see activities.
    </div>

    <template v-else>
      <ActivityForm
        :tripId="tripId"
        :editingActivity="editingActivity"
        @saved="handleSaved"
        @cancel="handleCancel"
      />

      <div v-if="loading" style="margin-top:8px;">Loading activities…</div>
      <div v-else-if="error" style="margin-top:8px; color:#b00020;">{{ error }}</div>
      <div v-else-if="activities.length === 0" style="margin-top:8px; color:#666;">
        No activities yet.
      </div>

      <ActivityList
        v-else
        :tripId="tripId"
        :activities="activities"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </template>
  </section>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useTripStore } from "@/stores/useTripStore";

import ActivityForm from "./ActivityForm.vue";
import ActivityList from "./ActivityList.vue";

const props = defineProps({
  tripId: { type: String, default: null },
});

const tripStore = useTripStore();
const editingActivity = ref(null);

const activities = computed(() => {
  if (!props.tripId) return [];
  return tripStore.activitiesByTripId?.[props.tripId] || [];
});

const loading = computed(() => {
  if (!props.tripId) return false;
  return !!tripStore.activitiesLoadingByTripId?.[props.tripId];
});

const error = computed(() => {
  if (!props.tripId) return null;
  return tripStore.activitiesErrorByTripId?.[props.tripId] || null;
});

// dacă se schimbă tripId (sau intri prima dată), încărcăm activities dacă nu sunt în cache
watch(
  () => props.tripId,
  async (id) => {
    editingActivity.value = null;
    if (!id) return;
    if (!tripStore.activitiesByTripId?.[id]) {
      await tripStore.fetchActivities(id);
    }
  },
  { immediate: true }
);

function handleEdit(activity) {
  editingActivity.value = activity;
}

async function handleDelete(activityId) {
  await tripStore.deleteActivity(props.tripId, activityId);
  if (editingActivity.value?.id === activityId) {
    editingActivity.value = null;
  }
}

function handleSaved() {
  editingActivity.value = null;
}

function handleCancel() {
  editingActivity.value = null;
}
</script>
