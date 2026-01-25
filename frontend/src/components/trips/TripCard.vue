<template>
  <div style="border:1px solid #ddd; border-radius:8px; padding:16px;">
    <div style="display:flex; justify-content:space-between; gap:12px; align-items:start;">
      <div>
        <div style="font-weight:700; font-size:18px;">{{ trip.country }}</div>
        <div style="opacity:.8;">Date: {{ trip.date }}</div>
        <div style="opacity:.8;">Budget: {{ trip.budget }}</div>
      </div>

      <div style="display:flex; gap:8px;">
        <button @click="toggle">{{ open ? "Hide activities" : "Show activities" }}</button>
        <button @click="removeTrip" style="color:#b00020;">Delete trip</button>
      </div>
    </div>

    <ActivitiesPanel v-if="open" :tripId="trip.id" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useTripStore } from "../../stores/useTripStore";
import ActivitiesPanel from "../activities/ActivitiesPanel.vue";

const props = defineProps({ trip: { type: Object, required: true } });

const tripStore = useTripStore();
const open = ref(false);

async function toggle() {
  open.value = !open.value;
  if (open.value) {
    // load activities only when opening
    if (!tripStore.activitiesByTripId[props.trip.id]) {
      await tripStore.fetchActivities(props.trip.id);
    }
  }
}

async function removeTrip() {
  if (!confirm("Delete this trip? (activities will be deleted too if backend does cascade)")) return;
  await tripStore.deleteTrip(props.trip.id);
}
</script>
