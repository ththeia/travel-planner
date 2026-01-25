<template>
  <div style="border:1px solid #eee; border-radius:8px; padding:10px; display:flex; justify-content:space-between; gap:12px;">
    <div>
      <div style="font-weight:600;">{{ activity.name }}</div>
      <div style="opacity:.8;">Place: {{ activity.place }}</div>
      <div style="opacity:.8;">Price: {{ activity.price }}</div>
    </div>

    <div style="display:flex; gap:8px; align-items:start;">
      <button @click="$emit('edit')">Edit</button>
      <button @click="$emit('delete')" style="color:#b00020;">Delete</button>
    </div>
  </div>
</template>

<script setup>
defineProps({ activity: { type: Object, required: true } });
defineEmits(["edit", "delete"]);
</script>
