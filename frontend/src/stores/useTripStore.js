import { defineStore } from "pinia";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const useTripStore = defineStore("trips", {
  state: () => ({
    // trips
    trips: [],
    loading: false,
    error: null,
    selectedTripId: null,

    // activities
    activitiesByTripId: {},            // { [tripId]: Activity[] }
    activitiesLoadingByTripId: {},     // { [tripId]: boolean }
    activitiesErrorByTripId: {},       // { [tripId]: string|null }
  }),

  getters: {
    selectedTrip(state) {
      return state.trips.find((t) => t.id === state.selectedTripId) || null;
    },
  },

  actions: {

    // TRIPS
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

        // adăugăm în listă (sus)
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

        // actualizăm în listă
        const idx = this.trips.findIndex((t) => t.id === tripId);
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

        // backend-ul tău returnează 204 pe succes
        if (!res.ok && res.status !== 204) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `DELETE failed: ${res.status}`);
        }

        this.trips = this.trips.filter((t) => t.id !== tripId);
        if (this.selectedTripId === tripId) {
          this.selectedTripId = this.trips[0]?.id ?? null;
        }

        // curățăm și cache-ul de activities pentru trip-ul șters
        delete this.activitiesByTripId[tripId];
        delete this.activitiesLoadingByTripId[tripId];
        delete this.activitiesErrorByTripId[tripId];
      } catch (e) {
        this.error = e.message || "Failed to delete trip";
        throw e;
      }
    },

    selectTrip(tripId) {
      this.selectedTripId = tripId;
    },

  
    // ACTIVITIES
    async fetchActivities(tripId) {
      if (!tripId) return;
      this.activitiesLoadingByTripId[tripId] = true;
      this.activitiesErrorByTripId[tripId] = null;

      try {
        const res = await fetch(`${API}/api/trips/${tripId}/activities`);
        if (!res.ok) throw new Error(`GET activities failed: ${res.status}`);
        const data = await res.json();
        this.activitiesByTripId[tripId] = data;
      } catch (e) {
        this.activitiesErrorByTripId[tripId] = e.message || "Failed to fetch activities";
      } finally {
        this.activitiesLoadingByTripId[tripId] = false;
      }
    },

    async createActivity(tripId, payload) {
      if (!tripId) return;
      this.activitiesErrorByTripId[tripId] = null;

      try {
        const res = await fetch(`${API}/api/trips/${tripId}/activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || `POST activity failed: ${res.status}`);

        const arr = this.activitiesByTripId[tripId] || [];
        this.activitiesByTripId[tripId] = [data, ...arr];
        return data;
      } catch (e) {
        this.activitiesErrorByTripId[tripId] = e.message || "Failed to create activity";
        throw e;
      }
    },

    async updateActivity(tripId, activityId, payload) {
      if (!tripId || !activityId) return;
      this.activitiesErrorByTripId[tripId] = null;

      try {
        const res = await fetch(`${API}/api/trips/${tripId}/activities/${activityId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || `PUT activity failed: ${res.status}`);

        const arr = this.activitiesByTripId[tripId] || [];
        this.activitiesByTripId[tripId] = arr.map((a) =>
          a.id === activityId ? { ...a, ...data } : a
        );
        return data;
      } catch (e) {
        this.activitiesErrorByTripId[tripId] = e.message || "Failed to update activity";
        throw e;
      }
    },

    async deleteActivity(tripId, activityId) {
      if (!tripId || !activityId) return;
      this.activitiesErrorByTripId[tripId] = null;

      try {
        const res = await fetch(`${API}/api/trips/${tripId}/activities/${activityId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `DELETE activity failed: ${res.status}`);
        }

        const arr = this.activitiesByTripId[tripId] || [];
        this.activitiesByTripId[tripId] = arr.filter((a) => a.id !== activityId);
      } catch (e) {
        this.activitiesErrorByTripId[tripId] = e.message || "Failed to delete activity";
        throw e;
      }
    },
  },
});
