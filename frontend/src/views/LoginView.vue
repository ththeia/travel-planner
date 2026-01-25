<template>
  <div style="max-width:420px; margin:40px auto;">
    <h1>Login</h1>

    <div style="display:grid; gap:10px; margin-top:12px;">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="onLogin" :disabled="loading">Login</button>
    </div>

    <p v-if="error" style="color:#b00020; margin-top:10px;">{{ error }}</p>

    <p style="margin-top:14px;">
      Don’t have an account?
      <router-link to="/register">Register</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref(null);
const loading = ref(false);

async function onLogin() {
  error.value = null;
  loading.value = true;

  try {
    await authStore.login(email.value.trim(), password.value);

    // după login -> trips
    router.push("/trips");
  } catch (e) {
    console.error("Login error:", e);
    error.value = `${e.code || "auth/error"}: ${e.message || "Login failed"}`;
  } finally {
    loading.value = false;
  }
}
</script>
