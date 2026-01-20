<template>
  <div class="layout">
    <header class="header">Travel Planner</header>
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.header {
  padding: 1rem;
  background: #1976d2;
  color: white;
  font-weight: bold;
}
.content {
  flex: 1;
  padding: 1rem;
}
</style>