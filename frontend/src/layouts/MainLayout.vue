<template>
  <div class="layout">
    <header class="header">
      <div class="header-inner">
        <router-link to="/trips" class="brand" aria-label="Mergi la Călătoriile mele">
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
            Deconectare
          </button>
        </div>
      </div>
    </header>

    <main :class="['content', { 'content--auth': isAuthPage }]">
      <!-- Auth pages: full-bleed -->
      <router-view v-if="isAuthPage" />

      <!-- App pages: container + surface -->
      <div v-else class="content-inner tp tp-surface">
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

const isAuthPage = computed(() => route.path === "/login" || route.path === "/register");
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
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.header {
  position: sticky;
  top: 0;
  z-index: 20;

  background: rgba(251, 247, 242, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  border-bottom: 1px solid rgba(109, 90, 207, 0.10);

}

.header {
  box-shadow: 0 8px 18px rgba(31,41,55,.04);
}

.header-inner {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  max-width: 1100px;
  margin: 0 auto;
  padding: 0 18px;

  background: transparent;   
  border-radius: 0;          
}


.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--tp-text);
  font-weight: 900;
  letter-spacing: 0.1px;
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
    rgba(109,90,207, 0.18),
    rgba(20,184,166, 0.12)
  );
  border: 1px solid rgba(232,225,217,.85);
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
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 900;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.05s ease, background 0.15s ease, box-shadow 0.2s ease;
}

.btn:active {
  transform: translateY(1px);
}

.btn-logout {
  background: var(--tp-primary);
  color: #fff;
  box-shadow: 0 12px 22px rgba(109,90,207,.20);
}

.btn-logout:hover {
  background: var(--tp-primary-hover);
  box-shadow: 0 16px 26px rgba(109,90,207,.22);
}

/* Content */
.content {
  flex: 1;
  padding: 18px;
}

.content--auth {
  padding: 0; /* important */
}

.content-inner {
  max-width: 1100px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 520px) {
  .header-inner { padding: 0 14px; }
}
</style>
