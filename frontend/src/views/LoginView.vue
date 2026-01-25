<template>
  <div class="login-page">
    <div class="login-card">
      <div class="brand">
        <div class="logo" aria-hidden="true">✈️</div>
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

<style scoped>
/* Variabile + font global */
:global(:root) {
  --bg1: #c7f9ff;         /* sky */
  --bg2: #ffe6f1;         /* blush */
  --accent: #14b8a6;      /* teal (single color button) */
  --accentHover: #0d9488; /* darker teal */
  --text: #12212a;
  --muted: #5c6b73;
  --card: #ffffff;
  --border: #e6eef2;
}

:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
  color: var(--text);
}

/* Page background */
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;

  background:
    radial-gradient(1200px 600px at 20% 10%, var(--bg1), transparent 60%),
    radial-gradient(900px 500px at 80% 20%, var(--bg2), transparent 55%),
    linear-gradient(180deg, #f7fbff, #fff);
}

/* Card */
.login-card {
  width: min(440px, 100%);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(16, 24, 40, 0.10);
  padding: 22px;
}

/* Brand */
.brand {
  text-align: center;
  margin-bottom: 16px;
}

.logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 10px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 26px;
  background: linear-gradient(
    135deg,
    rgba(202, 145, 229, 0.18),
    rgba(234, 222, 121, 0.45)
  );
  border: 1px solid var(--border);
}

.brand h1 {
  margin: 0;
  font-size: 22px;
  letter-spacing: 0.2px;
}

.brand p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 14px;
}

/* Form */
.form {
  display: grid;
  gap: 12px;
  margin-top: 10px;
}

label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: var(--muted);
}

input {
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  outline: none;
  font-size: 14px;
  transition: box-shadow 0.15s, border-color 0.15s, background 0.15s;
  background: #fbfdff;
}

input::placeholder {
  color: rgba(18, 33, 42, 0.45);
}

input:focus {
  border-color: rgba(20, 184, 166, 0.65);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.18);
  background: #fff;
}

input:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

/* Button (single solid color) */
.btn {
  margin-top: 4px;
  padding: 12px 14px;
  border: 0;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  color: #fff;
  background: var(--accent);
  box-shadow: 0 10px 22px rgba(20, 184, 166, 0.20);
  transition: transform 0.05s ease, filter 0.15s ease, background 0.15s ease;
}

.btn:hover {
  background: var(--accentHover);
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

/* Error */
.error {
  margin: 2px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  color: #b00020;
  background: rgba(176, 0, 32, 0.06);
  border: 1px solid rgba(176, 0, 32, 0.18);
}

/* Hint */
.hint {
  margin: 8px 0 0;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
}

.hint-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 700;
}

.hint-link:hover {
  text-decoration: underline;
}

/* Responsive tweaks */
@media (max-width: 420px) {
  .login-card {
    padding: 18px;
    border-radius: 16px;
  }

  .brand h1 {
    font-size: 20px;
  }
}
</style>
