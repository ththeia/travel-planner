<template>
  <div style="border:1px dashed #ccc; padding:12px; border-radius:8px; margin-bottom:12px;">
    <div style="font-weight:600; margin-bottom:8px;">
      {{ editingActivity ? "Edit activity" : "Add activity" }}
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr 160px; gap:12px;">
      <div>
        <label>Name</label>
        <input v-model="form.name" placeholder="Castelul Bran" style="width:100%;" />
      </div>
      <div>
        <label>Place</label>
        <input v-model="form.place" placeholder="Brasov" style="width:100%;" />
      </div>
      <div>
        <label>Price</label>
        <input v-model.number="form.price" type="number" min="0" style="width:100%;" />
      </div>
    </div>

    <div style="margin-top:10px; display:flex; gap:8px; align-items:center;">
      <button @click="save">{{ editingActivity ? "Save changes" : "Add" }}</button>
      <button v-if="editingActivity" @click="cancel">Cancel</button>
      <span v-if="error" style="color:#b00020;">{{ error }}</span>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref } from "vue";
import { useTripStore } from "../../stores/useTripStore";

const props = defineProps({
  tripId: { type: String, required: true },
  editingActivity: { type: Object, default: null },
});
const emit = defineEmits(["saved", "cancel"]);

const tripStore = useTripStore();
const error = ref("");

const form = reactive({ name: "", place: "", price: 0 });

watch(
  () => props.editingActivity,
  (a) => {
    error.value = "";
    if (a) {
      form.name = a.name ?? "";
      form.place = a.place ?? "";
      form.price = a.price ?? 0;
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
  if (!form.name.trim()) return (error.value = "name is required"), false;
  if (!form.place.trim()) return (error.value = "place is required"), false;
  if (typeof form.price !== "number" || Number.isNaN(form.price) || form.price < 0)
    return (error.value = "price must be a number >= 0"), false;
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
