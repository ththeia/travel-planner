<template>
  <div class="tp-list">
    <TripCard v-for="t in trips" :key="t.id" :trip="t" />
  </div>
</template>

<script setup>
import TripCard from "./TripCard.vue";
defineProps({ trips: { type: Array, required: true } });
</script>
