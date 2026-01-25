<template>
  <div style="display:grid; gap:12px;">
    <div
      v-for="a in activities"
      :key="a.id"
      style="border:1px solid #ddd; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:flex-start;"
    >
      <div>
        <strong>{{ a.name }}</strong><br />
        Place: {{ a.place }}<br />
        Price: {{ a.price }}
      </div>

      <div style="display:flex; gap:8px;">
        <button @click="$emit('edit', a)">Edit</button>
        <button @click="$emit('delete', a.id)" style="color:red;">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tripId: { type: String, required: true },
  activities: { type: Array, required: true },
});

defineEmits(["edit", "delete"]);
</script>
