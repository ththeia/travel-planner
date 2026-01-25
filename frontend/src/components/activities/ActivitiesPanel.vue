<template>
  <section style="border:1px solid #ddd; padding:12px; border-radius:8px;">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0;">Activities</h2>

      <!-- butonul Add (îl poți lăsa să ducă în pagina nouă sau îl faci inline, vezi mai jos) -->
      <router-link :to="`/trips/${tripId}/add-activity`">
        <button>Add activity</button>
      </router-link>
    </div>

    <!-- FORM EDIT INLINE -->
    <div v-if="editingActivity" style="margin-top:12px;">
      <ActivityForm
        :tripId="tripId"
        :editingActivity="editingActivity"
        @saved="onSaved"
        @cancel="onCancel"
      />
    </div>

    <div style="margin-top:12px;">
      <div v-if="loading">Loading activities…</div>
      <div v-else-if="error" style="color:#b00020;">{{ error }}</div>
      <div v-else-if="activities.length === 0" style="color:#666;">
        No activities yet.
      </div>

      <ActivityList
        v-else
        :tripId="tripId"
        :activities="activities"
        @edit="onEdit"
        @delete="onDelete"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useTripStore } from "@/stores/useTripStore";

import ActivityList from "./ActivityList.vue";
import ActivityForm from "./ActivityForm.vue";

const props = defineProps({
  tripId: { type: String, required: true },
});

const tripStore = useTripStore();
const editingActivity = ref(null);

const activities = computed(() => tripStore.activitiesByTripId?.[props.tripId] || []);
const loading = computed(() => !!tripStore.activitiesLoadingByTripId?.[props.tripId]);
const error = computed(() => tripStore.activitiesErrorByTripId?.[props.tripId] || null);

watch(
  () => props.tripId,
  async (id) => {
    editingActivity.value = null;
    if (!id) return;
    await tripStore.fetchActivities(id);
  },
  { immediate: true }
);

function onEdit(activity) {
  editingActivity.value = activity;
}

async function onDelete(activityId) {
  await tripStore.deleteActivity(props.tripId, activityId);
  if (editingActivity.value?.id === activityId) {
    editingActivity.value = null;
  }
}

function onSaved() {
  editingActivity.value = null;
}

function onCancel() {
  editingActivity.value = null;
}
</script>
