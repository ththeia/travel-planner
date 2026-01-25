<template>
  <section style="border:1px solid #ddd; padding:12px; border-radius:8px;">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0;">Activities</h2>

      <router-link :to="`/trips/${tripId}/add-activity`">
        <button>Add activity</button>
      </router-link>
    </div>

    <div v-if="!tripId" style="color:#666; margin-top:8px;">
      Select a trip to see activities.
    </div>

    <template v-else>
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
import ActivityList from "./ActivityList.vue";

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
    if (!tripStore.activitiesByTripId?.[id]) {
      await tripStore.fetchActivities(id);
    }
  },
  { immediate: true }
);

function handleEdit(activity) {
  // pentru moment edit rămâne inline (funcționează deja)
  editingActivity.value = activity;
}

async function handleDelete(activityId) {
  await tripStore.deleteActivity(props.tripId, activityId);
}
</script>
