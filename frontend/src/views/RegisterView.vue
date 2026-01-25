<template>
  <div style="max-width:420px; margin:40px auto;">
    <h1>Register</h1>

    <div style="display:grid; gap:10px; margin-top:12px;">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password (min 6 chars)" />
      <button @click="onRegister" :disabled="loading">Create account</button>
    </div>

    <p v-if="error" style="color:#b00020; margin-top:10px;">{{ error }}</p>

    <p style="margin-top:14px;">
      Already have an account?
      <router-link to="/login">Login</router-link>
    </p>

    <button @click="goBack" style="margin-top:16px;">
      ← Back
    </button>
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

async function onRegister() {
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
