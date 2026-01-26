<template>
  <div class="tp">
    <div class="tp-toolbar">
      <div>
        <h1 class="tp-page-title">Activități</h1>
        <p class="tp-page-subtitle">Adaugă și editează activitățile pentru această călătorie.</p>
      </div>

      <div class="tp-toolbar-right">
        <button class="tp-btn" type="button" @click="goBack">← Înapoi la călătorii</button>
      </div>
    </div>

    <div class="tp-card tp-card--soft" style="margin-bottom: 14px;">
      <h3 class="tp-title" style="margin-bottom: 10px;">Adaugă o activitate</h3>

      <ActivityForm
        :tripId="tripId"
        :editingActivity="editingActivity"
        @saved="handleSaved"
        @cancel="handleCancel"
      />
    </div>

    <div class="tp-card">
      <h3 class="tp-title" style="margin-bottom: 10px;">Lista activităților</h3>

      <div v-if="loading" class="tp-muted">Se încarcă…</div>
      <div v-else-if="error" class="tp-error">{{ error }}</div>
      <div v-else-if="activities.length === 0" class="tp-muted">Nu există activități de afișat.</div>

      <ActivityList
        v-else
        :tripId="tripId"
        :activities="activities"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useTripStore } from "@/stores/useTripStore";
import ActivityForm from "@/components/activities/ActivityForm.vue";
import ActivityList from "@/components/activities/ActivityList.vue";

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();

const tripId = String(route.params.tripId);
const editingActivity = ref(null);

const activities = computed(() => tripStore.activitiesByTripId?.[tripId] || []);
const loading = computed(() => !!tripStore.activitiesLoadingByTripId?.[tripId]);
const error = computed(() => tripStore.activitiesErrorByTripId?.[tripId] || null);

function goBack() {
  router.push("/trips");
}

onMounted(async () => {
  await tripStore.fetchActivities(tripId);
});

function handleEdit(activity) {
  editingActivity.value = activity;
}

async function handleDelete(activityId) {
  await tripStore.deleteActivity(tripId, activityId);
  if (editingActivity.value?.id === activityId) editingActivity.value = null;
}

function handleSaved() {
  editingActivity.value = null;
}

function handleCancel() {
  editingActivity.value = null;
}
</script>
