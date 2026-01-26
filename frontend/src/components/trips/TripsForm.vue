<template>
  <div class="tp-card">
    <h3 style="margin: 0 0 12px; font-weight: 900;">Creează o călătorie</h3>

    <div class="tp-form-grid">
      <label class="tp-field">
        <span>Țara</span>
        <input v-model="form.country" class="tp-input" placeholder="ex: Italia" />
      </label>

      <label class="tp-field">
        <span>Data (YYYY-MM-DD)</span>
        <input v-model="form.date" class="tp-input" placeholder="2026-02-01" />
      </label>

      <label class="tp-field">
        <span>Buget</span>
        <input v-model.number="form.budget" class="tp-input" type="number" min="0" />
      </label>
    </div>

    <div class="tp-actions" style="margin-top: 12px;">
      <button class="tp-btn tp-btn--primary" type="button" @click="save" :disabled="tripStore.loading">
        Salvează
      </button>

      <span v-if="error" class="tp-error" style="margin: 0; padding: 8px 10px;">
        {{ error }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useTripStore } from "../../stores/useTripStore";

const tripStore = useTripStore();

const form = reactive({ country: "", date: "", budget: 0 });
const error = ref("");

function validateCalendarDateYYYYMMDD(dateStr) {
  // format strict YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return "Data trebuie să fie în formatul YYYY-MM-DD";
  }

  const [yStr, mStr, dStr] = dateStr.split("-");
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return "Data este invalidă";
  }

  const currentYear = new Date().getFullYear();
  if (year < currentYear) {
    return `Anul trebuie să fie cel puțin ${currentYear}`;
  }

  if (month < 1 || month > 12) {
    return "Luna trebuie să fie între 01 și 12";
  }

  // zile valide pentru luna respectivă (include leap year)
  const daysInMonth = new Date(year, month, 0).getDate(); // month: 1-12 OK
  if (day < 1 || day > daysInMonth) {
    return `Ziua trebuie să fie între 01 și ${String(daysInMonth).padStart(2, "0")}`;
  }

  return null;
}

async function save() {
  error.value = "";

  if (!form.country.trim()) {
    error.value = "Trebuie să specifici țara de destinație.";
    return;
  }

  const dateStr = String(form.date || "").trim();
  if (!dateStr) {
    error.value = "Data este necesară.";
    return;
  }

  const dateErr = validateCalendarDateYYYYMMDD(dateStr);
  if (dateErr) {
    error.value = dateErr;
    return;
  }

  const budget = Number(form.budget);
  if (Number.isNaN(budget) || budget < 0) {
    error.value = "Bugetul trebuie să fie ≥ 0.";
    return;
  }

  try {
    await tripStore.createTrip({
      country: form.country.trim(),
      date: dateStr,
      budget,
    });

    form.country = "";
    form.date = "";
    form.budget = 0;

    await tripStore.fetchTrips();
  } catch (e) {
    error.value = e?.message || "Nu s-au putut salva datele.";
  }
}
</script>
