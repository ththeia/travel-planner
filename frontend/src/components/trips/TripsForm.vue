
<template>
  <div style="border:1px solid #ddd; padding:16px; border-radius:8px; margin-bottom:16px;">
    <h3 style="margin:0 0 12px;">Add Trip</h3>

    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
      <div>
        <label>Country</label>
        <input v-model="form.country" placeholder="Romania" style="width:100%;" />
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

function validate() {
  error.value = "";
  if (!form.country.trim()) return (error.value = "country is required"), false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) return (error.value = "date must be YYYY-MM-DD"), false;
  if (typeof form.budget !== "number" || Number.isNaN(form.budget) || form.budget < 0)
    return (error.value = "budget must be a number >= 0"), false;
  return true;
}

async function save() {
  if (!validate()) return;

  await tripStore.createTrip({
    country: form.country.trim(),
    date: form.date.trim(),
    budget: form.budget,
  });

  form.country = "";
  form.date = "";
  form.budget = 0;
}
</script>
