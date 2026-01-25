<template>
  <div style="text-align:center; margin-top:120px;">
    <h1 style="font-size:32px;"> Travel Planner</h1>
    <p style="margin:12px 0 24px; color:#555;">
      Plan your trips and activities easily.
    </p>

    <!-- dacă NU e logat -->
    <div v-if="!isAuthenticated" style="display:flex; gap:12px; justify-content:center;">
      <router-link to="/login">
        <button>Login</button>
      </router-link>

      <router-link to="/register">
        <button>Register</button>
      </router-link>
    </div>

    <!-- dacă E logat -->
    <div v-else style="display:flex; gap:12px; justify-content:center;">
      <router-link to="/trips">
        <button>→ Go to My Trips</button>
      </router-link>

      <button @click="logout">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";

const authStore = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);

async function logout() {
  await authStore.logout();
  router.push("/");
}
</script>
