<template>
  <div class="login-page">
    <div class="login-card">
      <div class="brand">
        <div class="logo" aria-hidden="true">✈️</div>
        <div class="brand-accent" aria-hidden="true"></div>
        <h1>Travel Planner</h1>
        <p>Plan your trips</p>
      </div>

      <form class="form" @submit.prevent="onLogin" novalidate>
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
            placeholder="••••••••"
            autocomplete="current-password"
            :disabled="loading"
            required
          />
        </label>

        <button type="submit" class="btn" :disabled="loading || !canSubmit">
          {{ loading ? "Logging in..." : "Log in" }}
        </button>

        <p v-if="error" class="error" role="alert">{{ error }}</p>

        <p class="hint">
          Don’t have an account?
          <router-link class="hint-link" to="/register">Create one</router-link>
        </p>
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

// UI-only: previne submit gol
const canSubmit = computed(() => {
  return email.value.trim().length > 0 && password.value.length > 0;
});

async function onLogin() {
  if (loading.value) return;

  error.value = null;
  loading.value = true;

  try {
    await authStore.login(email.value.trim(), password.value);
    router.push("/trips");
  } catch (e) {
    console.error("Login error:", e);
    error.value = `${e.code || "auth/error"}: ${e.message || "Login failed"}`;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped src="@/style/auth.css"></style>
