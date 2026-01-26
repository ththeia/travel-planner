<template>
  <div class="login-page">
    <div class="login-card">
      <div class="brand">
        <div class="logo" aria-hidden="true">✈️</div>
        <div class="brand-accent" aria-hidden="true"></div>
        <h1>Travel Planner</h1>
        <p>Create your account to start planning </p>
      </div>

      <form class="form" @submit.prevent="onRegister" novalidate>
        <label>
          Email
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            inputmode="email"
            :disabled="loading"
            required
          />
        </label>

        <label>
          Password
          <input
            v-model="password"
            type="password"
            placeholder="Password (min 6 chars)"
            autocomplete="new-password"
            :disabled="loading"
            required
          />
        </label>

        <button type="submit" class="btn" :disabled="loading || !canSubmit">
          {{ loading ? "Creating..." : "Create account" }}
        </button>

        <p v-if="error" class="error" role="alert">{{ error }}</p>

        <p class="hint">
          Already have an account?
          <router-link class="hint-link" to="/login">Login</router-link>
        </p>

        <button type="button" class="btn-secondary" @click="goBack" :disabled="loading">
          ← Back
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref(null);
const loading = ref(false);

// UI-only: prevenim submit gol (nu schimbă logica auth)
const canSubmit = computed(() => {
  return email.value.trim().length > 0 && password.value.length > 0;
});

async function onRegister() {
  if (loading.value) return;

  error.value = null;
  loading.value = true;
  try {
    console.log("API KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
    await authStore.register(email.value.trim(), password.value);
    router.push("/trips");
  } catch (e) {
    console.error("Register error:", e);
    error.value = `${e.code || "auth/error"}: ${e.message || "Registration failed"}`;
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push("/");
}
</script>

<style scoped src="@/style/auth.css"></style>
