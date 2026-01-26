<template>
  <div class="tp-list">
    <div v-for="a in activities" :key="a.id" class="tp-card tp-activity-card">
      <div class="tp-row" style="align-items: center;">
        <div style="min-width:0;">
          <p class="tp-activity-title">{{ a.name }}</p>

          <div class="tp-meta" style="margin-top: 8px;">
            <span class="tp-badge"> {{ a.place }}</span>
            <span class="tp-badge">💸 {{ a.price }}</span>
          </div>
        </div>

        <div class="tp-actions" style="justify-content: flex-end;">
          <button class="tp-btn" type="button" @click="$emit('edit', a)">Editează</button>
          <button class="tp-btn tp-btn--danger" type="button" @click="$emit('delete', a.id)">
            Șterge
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tripId: { type: String, required: true },
  activities: { type: Array, required: true },
});

defineEmits(["edit", "delete"]);
</script>
