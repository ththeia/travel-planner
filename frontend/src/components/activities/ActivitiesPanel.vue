<template>
  <section class="tp-panel">
    <div class="tp-row">
      <div>
        <h4 class="tp-title">Activități</h4>
        <p class="tp-page-subtitle" style="margin-top: 6px;">
          Gestionează activitățile pentru această călătorie.
        </p>
      </div>

      <button class="tp-btn tp-btn--primary" type="button" @click="goAddActivity">
        Adaugă activitate
      </button>
    </div>

    <div v-if="editingActivity" style="margin-top: 12px;">
      <ActivityForm
        :tripId="tripId"
        :editingActivity="editingActivity"
        @saved="onSaved"
        @cancel="onCancel"
      />
    </div>

    <div style="margin-top: 12px;">
      <div v-if="loading" class="tp-muted">Se încarcă…</div>
      <div v-else-if="error" class="tp-error">{{ error }}</div>
      <div v-else-if="activities.length === 0" class="tp-muted">Nu există activități de afișat.</div>

      <ActivityList
        v-else
        :tripId="tripId"
        :activities="activities"
        @edit="startEdit"
        @delete="removeActivity"
      />
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useTripStore } from "@/stores/useTripStore";
import ActivityForm from "./ActivityForm.vue";
import ActivityList from "./ActivityList.vue";

const props = defineProps({ tripId: { type: String, required: true } });

const router = useRouter();
const tripStore = useTripStore();
const editingActivity = ref(null);

const loading = computed(() => tripStore.loading);
const error = computed(() => tripStore.error);

const activities = computed(() => {
  const map = tripStore.activitiesByTripId || {};
  return map[String(props.tripId)] || [];
});

onMounted(() => {
  if (typeof tripStore.fetchActivities === "function") {
    tripStore.fetchActivities(String(props.tripId));
  }
});

function goAddActivity() {
  router.push(`/trips/${String(props.tripId)}/add-activity`);
}

function startEdit(activity) {
  editingActivity.value = activity;
}
function onSaved() {
  editingActivity.value = null;
}
function onCancel() {
  editingActivity.value = null;
}

async function removeActivity(activityId) {
  await tripStore.deleteActivity(String(props.tripId), activityId);
}
</script>
