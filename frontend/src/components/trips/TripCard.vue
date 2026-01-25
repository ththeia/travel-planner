<template>
  <div style="border:1px solid #ddd; border-radius:8px; padding:16px;">
    <div style="display:flex; justify-content:space-between; gap:12px; align-items:start;">
      <div>
        <template v-if="!isEditing">
          <div style="font-weight:700; font-size:18px;">{{ trip.country }}</div>
          <div style="opacity:.8;">Date: {{ trip.date }}</div>
          <div style="opacity:.8;">Budget: {{ trip.budget }}</div>
        </template>

        <template v-else>
         
            <div style="border: 1px dashed #ddd;border-radius: 8px;padding: 12px;margin-bottom: 16px;background: #fafafa;display: flex;flex-direction: column;gap: 8px;max-width: 420px;">
            <label style="display:flex; flex-direction:column; gap:4px;">
              <span style="font-weight:600;">Country</span>
              <input v-model.trim="editCountry" type="text" />
            </label>

            <label style="display:flex; flex-direction:column; gap:4px;">
              <span style="font-weight:600;">Date (YYYY-MM-DD)</span>
              <input v-model="editDate" type="date" />
            </label>

            <label style="display:flex; flex-direction:column; gap:4px;">
              <span style="font-weight:600;">Budget</span>
              <input v-model.number="editBudget" type="number" min="0" step="1" />
            </label>

            <p v-if="editError" style="color:#b00020; margin:0;">{{ editError }}</p>
          </div>
        </template>
      </div>

      <div style="display:flex; gap:8px;">
        <template v-if="!isEditing">
          <button @click="startEdit">Edit</button>
          <button @click="toggle">{{ open ? "Hide activities" : "Show activities" }}</button>
          <button @click="removeTrip" style="color:#b00020;">Delete trip</button>
        </template>

        <template v-else>
          <button @click="saveEdit">Save</button>
          <button @click="cancelEdit">Cancel</button>
        </template>
      </div>
    </div>

    <ActivitiesPanel v-if="open" :tripId="trip.id" />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useTripStore } from "../../stores/useTripStore";
import ActivitiesPanel from "../activities/ActivitiesPanel.vue";

const props = defineProps({ trip: { type: Object, required: true } });

const tripStore = useTripStore();
const open = ref(false);

const isEditing = ref(false);
const editCountry = ref("");
const editDate = ref("");
const editBudget = ref(0);
const editError = ref("");

function hydrateEditForm() {
  editCountry.value = props.trip.country ?? "";
  editDate.value = props.trip.date ?? "";
  editBudget.value = Number(props.trip.budget ?? 0);
}

function startEdit() {
  editError.value = "";
  hydrateEditForm();
  isEditing.value = true;
}

function cancelEdit() {
  editError.value = "";
  isEditing.value = false;
}

async function saveEdit() {
  editError.value = "";

  if (!editCountry.value) {
    editError.value = "Country is required.";
    return;
  }

  if (!editDate.value) {
    editError.value = "Date is required.";
    return;
  }

  const budget = Number(editBudget.value);
  if (Number.isNaN(budget) || budget < 0) {
    editError.value = "Budget must be a number >= 0.";
    return;
  }

  try {
    await tripStore.updateTrip(props.trip.id, {
      country: editCountry.value,
      date: editDate.value,
      budget,
    });
    isEditing.value = false;
  } catch (e) {
    editError.value = e?.message || "Failed to save changes.";
  }
}

// If trip changes from outside (e.g. refresh), keep edit form in sync
watch(
  () => props.trip,
  () => {
    if (isEditing.value) hydrateEditForm();
  },
  { deep: true }
);

async function toggle() {
  // Avoid odd UX while editing
  if (isEditing.value) return;

  open.value = !open.value;
  if (open.value) {
    // load activities only when opening (if the store supports it)
    const map = tripStore.activitiesByTripId || {};
    if (!map[props.trip.id] && typeof tripStore.fetchActivities === "function") {
      await tripStore.fetchActivities(props.trip.id);
    }
  }
}

async function removeTrip() {
  if (isEditing.value) return;
  if (!confirm("Delete this trip? (activities will be deleted too if backend does cascade)")) return;
  await tripStore.deleteTrip(props.trip.id);
}
</script>
