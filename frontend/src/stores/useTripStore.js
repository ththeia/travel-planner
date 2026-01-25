import { defineStore } from "pinia";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const useTripStore = defineStore("trips", {
  state: () => ({
    trips: [],
    loading: false,
    error: null,
    selectedTripId: null,
  }),

  getters: {
    selectedTrip(state) {
      return state.trips.find(t => t.id === state.selectedTripId) || null;
    },
  },

  actions: {
    async fetchTrips() {
      this.loading = true;
      this.error = null;
      try {
        const res = await fetch(`${API}/api/trips`);
        if (!res.ok) throw new Error(`GET /api/trips failed: ${res.status}`);
        const data = await res.json();
        this.trips = data;
        if (!this.selectedTripId && this.trips.length) {
          this.selectedTripId = this.trips[0].id;
        }
      } catch (e) {
        this.error = e.message || "Failed to fetch trips";
      } finally {
        this.loading = false;
      }
    },

    async createTrip(payload) {
      this.error = null;
      try {
        const res = await fetch(`${API}/api/trips`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || `POST failed: ${res.status}`);
        this.trips.unshift(data);
        this.selectedTripId = data.id;
        return data;
      } catch (e) {
        this.error = e.message || "Failed to create trip";
        throw e;
      }
    },

    async updateTrip(tripId, payload) {
      this.error = null;
      try {
        const res = await fetch(`${API}/api/trips/${tripId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || `PUT failed: ${res.status}`);

        const idx = this.trips.findIndex(t => t.id === tripId);
        if (idx !== -1) this.trips[idx] = { ...this.trips[idx], ...data };
        return data;
      } catch (e) {
        this.error = e.message || "Failed to update trip";
        throw e;
      }
    },

    async deleteTrip(tripId) {
      this.error = null;
      try {
        const res = await fetch(`${API}/api/trips/${tripId}`, { method: "DELETE" });
        if (!res.ok && res.status !== 204) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `DELETE failed: ${res.status}`);
        }

        this.trips = this.trips.filter(t => t.id !== tripId);
        if (this.selectedTripId === tripId) {
          this.selectedTripId = this.trips[0]?.id ?? null;
        }
      } catch (e) {
        this.error = e.message || "Failed to delete trip";
        throw e;
      }
    },

    selectTrip(tripId) {
      this.selectedTripId = tripId;
    },
  },
});
