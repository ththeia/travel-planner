import { defineStore } from 'pinia';

export const useTripStore = defineStore('trips', {
  state: () => ({
    trips: []
  })
});