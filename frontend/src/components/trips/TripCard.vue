<template>
  <div class="tp-card trip-card">
    <div class="trip-header">
      <div>
        <template v-if="!isEditing">
          <h3 class="tp-title">{{ trip.country }}</h3>

          <div class="tp-meta">
            <span class="tp-badge">📅 {{ trip.date }}</span>
            <span class="tp-badge">💸Buget: {{ trip.budget }}</span>
          </div>
        </template>

        <template v-else>
          <div class="tp-card tp-card--soft" style="padding: 12px; margin-top: 10px;">
            <div class="tp-form-grid">
              <label class="tp-field">
                <span>Țara</span>
                <input v-model.trim="editCountry" class="tp-input" type="text" />
              </label>

              <label class="tp-field">
                <span>Data</span>
                <input v-model="editDate" class="tp-input" type="date" />
              </label>

              <label class="tp-field">
                <span>Buget</span>
                <input v-model.number="editBudget" class="tp-input" type="number" min="0" step="1" />
              </label>
            </div>

            <div v-if="editError" class="tp-error" style="margin-top: 10px;">
              {{ editError }}
            </div>

            <div class="tp-actions" style="margin-top: 12px;">
              <button class="tp-btn tp-btn--primary" type="button" @click="saveEdit">Salvează</button>
              <button class="tp-btn" type="button" @click="cancelEdit">Renunță</button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div class="trip-actions" v-if="!isEditing">
      <button class="tp-btn" type="button" @click="startEdit">Editează</button>

      <button class="tp-btn" type="button" @click="toggle">
        {{ open ? "Ascunde activitățile" : "Vezi activitățile" }}
      </button>

      <button class="tp-btn tp-btn--danger" type="button" @click="removeTrip">Șterge</button>
    </div>

    <!-- IMPORTANT: String(id) -->
    <ActivitiesPanel v-if="open" :tripId="tripId" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
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

const tripId = computed(() => String(props.trip.id));

function validateCalendarDateYYYYMMDD(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "Data trebuie să fie în formatul YYYY-MM-DD";

  const [yStr, mStr, dStr] = dateStr.split("-");
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return "Data este invalidă";

  const currentYear = new Date().getFullYear();
  if (year < currentYear) return `Anul trebuie să fie mai mare de ${currentYear}.`;
  if (month < 1 || month > 12) return "Luna trebuie să fie între 01 și 12";

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return `Ziua trebuie să fie între 01 și ${String(daysInMonth).padStart(2, "0")}.`;

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

  if (!editCountry.value) return (editError.value = "Trebuie să specifici țara de destinație.");
  const dateStr = String(editDate.value || "").trim();
  if (!dateStr) return (editError.value = "Data este necesară.");

  const dateErr = validateCalendarDateYYYYMMDD(dateStr);
  if (dateErr) return (editError.value = dateErr);

  const budget = Number(editBudget.value);
  if (Number.isNaN(budget) || budget < 0) return (editError.value = "Bugetul trebuie să fie ≥ 0.");

  try {
    await tripStore.updateTrip(props.trip.id, { country: editCountry.value, date: dateStr, budget });
    isEditing.value = false;
  } catch (e) {
    editError.value = e?.message || "Modificările nu au fost salvate.";
  }
}

watch(
  () => props.trip,
  () => { if (isEditing.value) hydrateEditForm(); },
  { deep: true }
);

async function toggle() {
  if (isEditing.value) return;

  open.value = !open.value;

  if (open.value) {
    const map = tripStore.activitiesByTripId || {};
    const id = tripId.value;

    // dacă nu sunt încă în store, le aducem
    if (!map[id] && typeof tripStore.fetchActivities === "function") {
      await tripStore.fetchActivities(id);
    }
  }
}

async function removeTrip() {
  if (isEditing.value) return;
  if (!confirm("Vrei să ștergi această călătorie? Vor fi șterse și activitățile asociate.")) return;
  await tripStore.deleteTrip(props.trip.id);
}
</script>
