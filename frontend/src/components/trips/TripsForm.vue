<template>
  <div style="border:1px solid #ddd; padding:16px; border-radius:8px; margin-bottom:16px;">
    <h3 style="margin:0 0 12px;">Add Trip</h3>

    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
      <div>
        <label>Country</label>
        <input v-model="form.country" placeholder="Tara" style="width:100%;" />
      </div>

      <div>
        <label>Date (YYYY-MM-DD)</label>
        <input v-model="form.date" placeholder="2026-02-01" style="width:100%;" />
      </div>

      <div>
        <label>Budget</label>
        <input v-model.number="form.budget" type="number" min="0" style="width:100%;" />
      </div>
    </div>

    <div style="margin-top:12px; display:flex; gap:8px; align-items:center;">
      <button @click="save" :disabled="tripStore.loading">Save</button>
      <span v-if="error" style="color:#b00020;">{{ error }}</span>
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
    return `Anul trebuie sa fie mai mare de  ${currentYear}`;
  }

  if (month < 1 || month > 12) {
    return "Luna trebuie sa fie intre 01 si 12";
  }

  // zile valide pentru luna respectivă (include leap year)
  const daysInMonth = new Date(year, month, 0).getDate(); // month: 1-12 OK
  if (day < 1 || day > daysInMonth) {
    return `Ziua trebuie sa fie intre 01 si ${String(daysInMonth).padStart(2, "0")}`;
  }

  return null;
}

function validate() {
  error.value = "";

  if (!form.country.trim()) return (error.value = "country is required"), false;

  const dateStr = String(form.date || "").trim();
  const dateErr = validateCalendarDateYYYYMMDD(dateStr);
  if (dateErr) return (error.value = dateErr), false;

  if (typeof form.budget !== "number" || Number.isNaN(form.budget) || form.budget < 0) {
    return (error.value = "Bugetul trebuie sa fie mai mare sau egal cu 0"), false;
  }

  return true;
}

async function save() {
  if (!validate()) return;

  await tripStore.createTrip({
    country: form.country.trim(),
    date: String(form.date).trim(),
    budget: form.budget,
  });

  form.country = "";
  form.date = "";
  form.budget = 0;
}
</script>
