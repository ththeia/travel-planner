<template>
  <div>
    <h1>Add Activity</h1>

    <ActivityForm :tripId="tripId" />

    <div style="margin-top:16px;">
      <router-link to="/">← Back to My Trips</router-link>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import ActivityForm from "@/components/activities/ActivityForm.vue";

const route = useRoute();
const tripId = route.params.tripId;
</script>
