<template>
  <div style="display:grid; gap:8px;">
    <ActivityItem
      v-for="a in activities"
      :key="a.id"
      :activity="a"
      @edit="$emit('edit', a)"
      @delete="$emit('delete', a.id)"
    />
  </div>
</template>

<script setup>
import ActivityItem from "./ActivityItem.vue";

defineProps({
  tripId: { type: String, required: true },
  activities: { type: Array, required: true },
});
defineEmits(["edit", "delete"]);
</script>
