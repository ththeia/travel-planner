<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <router-link to="/trips" class="brand" aria-label="Go to Trips">
          <span class="brand-icon" aria-hidden="true">✈️</span>
          <span class="brand-text">Travel Planner</span>
        </router-link>

        <div class="actions">
          <button
            v-if="showLogout"
            class="btn btn-logout"
            type="button"
            @click="handleLogout"
          >
            Log out
          </button>
        </div>
      </div>
    </header>

    <main class="content">
      <div class="content-inner">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Nu afișăm Log out pe paginile publice
const isAuthPage = computed(() => route.path === "/login" || route.path === "/register");

// Afișăm Log out doar după ce Firebase a terminat init (loading=false) și există user
const showLogout = computed(() => !authStore.loading && !!authStore.user && !isAuthPage.value);

async function handleLogout() {
  try {
    await authStore.logout();
    router.push("/login");
  } catch (e) {
    console.error("Logout failed:", e);
  }
}
</script>

<style scoped>
:global(:root) {
  --bg1: #c7f9ff;
  --bg2: #ffe6f1;
  --accent: #14b8a6;
  --accentHover: #0d9488;
  --text: #12212a;
  --muted: #5c6b73;
  --card: #ffffff;
  --border: #e6eef2;
}

.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(1200px 600px at 10% 0%, rgba(199, 249, 255, 0.45), transparent 60%),
    radial-gradient(900px 500px at 90% 10%, rgba(255, 230, 241, 0.35), transparent 55%),
    linear-gradient(180deg, #f7fbff, #fff);
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 20;

  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  border-bottom: 1px solid var(--border);
  box-shadow: 0 6px 18px rgba(16, 24, 40, 0.06);
}

.header-inner {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  max-width: 1100px;
  margin: 0 auto;
  padding: 0 18px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text);
  font-weight: 800;
  letter-spacing: 0.2px;
}

.brand-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  font-size: 18px;

  background: linear-gradient(
    135deg,
    rgba(20, 184, 166, 0.18),
    rgba(255, 230, 241, 0.45)
  );
  border: 1px solid var(--border);
}

.brand-text {
  font-size: 16px;
}

/* Right actions */
.actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 8px 12px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.05s ease, filter 0.15s ease, background 0.15s ease;
}

.btn:active {
  transform: translateY(1px);
}

.btn-logout {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 10px 22px rgba(20, 184, 166, 0.18);
}

.btn-logout:hover {
  background: var(--accentHover);
}

/* Content */
.content {
  flex: 1;
  padding: 18px;
}

.content-inner {
  max-width: 1100px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 520px) {
  .header-inner {
    padding: 0 14px;
  }
}
</style>
