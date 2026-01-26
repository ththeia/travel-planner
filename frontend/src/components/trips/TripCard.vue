<template>
  <div style="border:1px solid #ddd; border-radius:8px; padding:16px;">
    <div style="display:flex; justify-content:space-between; gap:12px; align-items:start;">
      <div>
        <template v-if="!isEditing">
          <div style="font-weight:700; font-size:18px;">{{ trip.country }}</div>
          <div style="opacity:.8;">Data: {{ trip.date }}</div>
          <div style="opacity:.8;">Buget: {{ trip.budget }}</div>
        </template>

        <template v-else>
          <div
            style="border: 1px dashed #ddd;border-radius: 8px;padding: 12px;margin-bottom: 16px;background: #fafafa;display: flex;flex-direction: column;gap: 8px;max-width: 420px;"
          >
            <label style="display:flex; flex-direction:column; gap:4px;">
              <span style="font-weight:600;">Tara</span>
              <input v-model.trim="editCountry" type="text" />
            </label>

            <label style="display:flex; flex-direction:column; gap:4px;">
              <span style="font-weight:600;">Data (YYYY-MM-DD)</span>
              <input v-model="editDate" type="date" />
            </label>

            <label style="display:flex; flex-direction:column; gap:4px;">
              <span style="font-weight:600;">Buget</span>
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

function validateCalendarDateYYYYMMDD(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return "Data trebuie sa fie de forma YYYY-MM-DD";
  }

  const [yStr, mStr, dStr] = dateStr.split("-");
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return "Data Invalida";
  }

  const currentYear = new Date().getFullYear();
  if (year < currentYear) {
    return `Anul trebuie sa fie mai mare de ${currentYear}.`;
  }

  if (month < 1 || month > 12) {
    return "Luna trebuie sa fie intre 01 si 12";
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return `Ziua trebuie sa fie intre 01 si ${String(daysInMonth).padStart(2, "0")}.`;
  }

  return null;
}

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
    editError.value = "Trebuie sa specificati Tara de destinatie";
    return;
  }

  const dateStr = String(editDate.value || "").trim();
  if (!dateStr) {
    editError.value = "Data este necesara.";
    return;
  }

  const dateErr = validateCalendarDateYYYYMMDD(dateStr);
  if (dateErr) {
    editError.value = dateErr;
    return;
  }

  const budget = Number(editBudget.value);
  if (Number.isNaN(budget) || budget < 0) {
    editError.value = "Bugetul trebuie sa fie mai mare sau egal cu 0";
    return;
  }

  try {
    await tripStore.updateTrip(props.trip.id, {
      country: editCountry.value,
      date: dateStr,
      budget,
    });
    isEditing.value = false;
  } catch (e) {
    editError.value = e?.message || "Schimbarile nu au fost salvate.";
  }
}

watch(
  () => props.trip,
  () => {
    if (isEditing.value) hydrateEditForm();
  },
  { deep: true }
);

async function toggle() {
  if (isEditing.value) return;

  open.value = !open.value;
  if (open.value) {
    const map = tripStore.activitiesByTripId || {};
    if (!map[props.trip.id] && typeof tripStore.fetchActivities === "function") {
      await tripStore.fetchActivities(props.trip.id);
    }
  }
}

async function removeTrip() {
  if (isEditing.value) return;
  if (!confirm("Vrei sa stergi aceast Trip? Vor fi sterse si activitatile afiliate.")) return;
  await tripStore.deleteTrip(props.trip.id);
}
</script>
