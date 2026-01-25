<template>
  <div>
    <h1>Add Trip</h1>

    <TripsForm />

    <div style="margin-top:16px;">
      <router-link to="/">← Back to My Trips</router-link>
    </div>
  </div>
</template>

<script setup>
import TripsForm from "@/components/trips/TripsForm.vue";
</script>
