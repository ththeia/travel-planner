<template>
  <div class="tp-card tp-card--soft">
    <div style="font-weight: 900; margin-bottom: 10px;">
      {{ editingActivity ? "Editează activitatea" : "Adaugă o activitate" }}
    </div>

    <div class="tp-form-grid">
      <label class="tp-field">
        <span>Nume</span>
        <input v-model="form.name" class="tp-input" placeholder="ex: Castelul Bran" />
      </label>

      <label class="tp-field">
        <span>Loc</span>
        <input v-model="form.place" class="tp-input" placeholder="ex: Brașov" />
      </label>

      <label class="tp-field">
        <span>Preț</span>
        <input v-model.number="form.price" class="tp-input" type="number" min="0" />
      </label>
    </div>

    <div class="tp-actions" style="margin-top: 12px;">
      <button class="tp-btn tp-btn--primary" type="button" @click="save">
        {{ editingActivity ? "Salvează modificările" : "Adaugă" }}
      </button>

      <button v-if="editingActivity" class="tp-btn" type="button" @click="cancel">
        Renunță
      </button>
    </div>

    <div v-if="error" class="tp-error" style="margin-top: 12px;">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref } from "vue";
import { useTripStore } from "@/stores/useTripStore";

const props = defineProps({
  tripId: { type: String, required: true },
  editingActivity: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const tripStore = useTripStore();
const error = ref("");

const form = reactive({
  name: "",
  place: "",
  price: 0,
});

watch(
  () => props.editingActivity,
  (val) => {
    error.value = "";
    if (val) {
      form.name = val.name ?? "";
      form.place = val.place ?? "";
      form.price = Number(val.price ?? 0);
    } else {
      form.name = "";
      form.place = "";
      form.price = 0;
    }
  },
  { immediate: true }
);

function validate() {
  error.value = "";
  if (!form.name.trim()) return (error.value = "Numele este obligatoriu."), false;
  if (!form.place.trim()) return (error.value = "Locația este obligatorie."), false;
  if (typeof form.price !== "number" || Number.isNaN(form.price) || form.price < 0)
    return (error.value = "Prețul trebuie să fie ≥ 0."), false;
  return true;
}

async function save() {
  if (!validate()) return;

  const payload = { name: form.name.trim(), place: form.place.trim(), price: form.price };

  if (props.editingActivity) {
    await tripStore.updateActivity(props.tripId, props.editingActivity.id, payload);
  } else {
    await tripStore.createActivity(props.tripId, payload);
  }

  emit("saved");
  form.name = "";
  form.place = "";
  form.price = 0;
}

function cancel() {
  emit("cancel");
}
</script>
