<template>
  <div class="landing">
    <h1>🌍 Travel Planner</h1>

    <p style="margin: 12px 0 24px; font-size: 18px;">
      Plan your trips and activities easily.
    </p>

    <button @click="goToTrips" class="enter-btn">
      → Go to My Trips
    </button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function goToTrips() {
  router.push("/trips");
}
</script>

<style scoped>
.landing {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.enter-btn {
  font-size: 16px;
  padding: 10px 18px;
  cursor: pointer;
}
</style>
