<template>
  <div>
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h1>Activities</h1>
    </div>

    <div style="margin: 12px 0 18px;">
      <ActivityForm
        :tripId="tripId"
        :editingActivity="editingActivity"
        @saved="handleSaved"
        @cancel="handleCancel"
      />
    </div>

    <div style="border:1px solid #ddd; padding:12px; border-radius:8px;">
      <h2 style="margin:0 0 8px;">Activities List</h2>

      <div v-if="loading">Loading activities…</div>
      <div v-else-if="error" style="color:#b00020;">{{ error }}</div>
      <div v-else-if="activities.length === 0" style="color:#666;">
        No activities yet.
      </div>

      <ActivityList
        v-else
        :tripId="tripId"
        :activities="activities"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

   <button @click="goBack" style="margin-top:16px;">
     ← Back to My Trips
    </button>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";




import { useTripStore } from "@/stores/useTripStore";
import ActivityForm from "@/components/activities/ActivityForm.vue";
import ActivityList from "@/components/activities/ActivityList.vue";

const route = useRoute();
const tripId = route.params.tripId;

const tripStore = useTripStore();
const editingActivity = ref(null);

const activities = computed(() => tripStore.activitiesByTripId?.[tripId] || []);
const loading = computed(() => !!tripStore.activitiesLoadingByTripId?.[tripId]);
const error = computed(() => tripStore.activitiesErrorByTripId?.[tripId] || null);

const router = useRouter();

function goBack() {
  router.push("/trips");
}




onMounted(async () => {
  // încărcăm lista la intrarea în pagină
  await tripStore.fetchActivities(tripId);
});

function handleEdit(activity) {
  editingActivity.value = activity;
}

async function handleDelete(activityId) {
  await tripStore.deleteActivity(tripId, activityId);

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
