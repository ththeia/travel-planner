import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/useAuthStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useTripStore = defineStore("trip", {
  state: () => ({
    trips: [],
    loading: false,
    error: null,

    activitiesByTripId: {},
    activitiesLoadingByTripId: {},
    activitiesErrorByTripId: {},
  }),

  actions: {
    // helper: headers cu token pt write
    async authHeaders() {
      const authStore = useAuthStore();
      const token = await authStore.getToken();
      if (!token) return { "Content-Type": "application/json" };

      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    },

    async fetchTrips() {
      this.loading = true;
      this.error = null;

      try {
        const res = await fetch(`${API_BASE_URL}/api/trips`);
        if (!res.ok) throw new Error("Failed to fetch trips");

        const data = await res.json();

        // GET e public, dar UI-ul arată trips doar ale userului logat
        const authStore = useAuthStore();
        const uid = authStore.user?.uid;

        this.trips = uid
          ? data.filter((t) => t.createdBy === uid)
          : data;
      } catch (err) {
        this.error = err?.message || "Error fetching trips";
      } finally {
        this.loading = false;
      }
    },

    async createTrip(payload) {
      try {
        const headers = await this.authHeaders();

        const res = await fetch(`${API_BASE_URL}/api/trips`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const msg = await res.json().catch(() => null);
          throw new Error(msg?.message || "Failed to create trip");
        }

        const created = await res.json();

        // dacă e pentru userul curent, îl adăugăm în listă
        const authStore = useAuthStore();
        if (!authStore.user?.uid || created.createdBy === authStore.user.uid) {
          this.trips.unshift(created);
        }

        return created;
      } catch (err) {
        throw err;
      }
    },

    async updateTrip(tripId, payload) {
      try {
        const headers = await this.authHeaders();

        const res = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const msg = await res.json().catch(() => null);
          throw new Error(msg?.message || "Failed to update trip");
        }

        const updated = await res.json();

        this.trips = this.trips.map((t) => (t.id === tripId ? updated : t));

        return updated;
      } catch (err) {
        throw err;
      }
    },

    async deleteTrip(tripId) {
      try {
        const headers = await this.authHeaders();

        const res = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
          method: "DELETE",
          headers,
        });

        if (!res.ok && res.status !== 204) {
          const msg = await res.json().catch(() => null);
          throw new Error(msg?.message || "Failed to delete trip");
        }

        this.trips = this.trips.filter((t) => t.id !== tripId);

        // curățăm și cache-ul de activities
        delete this.activitiesByTripId[tripId];
        delete this.activitiesLoadingByTripId[tripId];
        delete this.activitiesErrorByTripId[tripId];
      } catch (err) {
        throw err;
      }
    },

    async fetchActivities(tripId) {
      this.activitiesLoadingByTripId[tripId] = true;
      this.activitiesErrorByTripId[tripId] = null;

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/trips/${tripId}/activities`
        );
        if (!res.ok) throw new Error("Failed to fetch activities");

        const data = await res.json();
        this.activitiesByTripId[tripId] = data;
      } catch (err) {
        this.activitiesErrorByTripId[tripId] =
          err?.message || "Error fetching activities";
      } finally {
        this.activitiesLoadingByTripId[tripId] = false;
      }
    },

    async createActivity(tripId, payload) {
      const headers = await this.authHeaders();

      const res = await fetch(`${API_BASE_URL}/api/trips/${tripId}/activities`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.message || "Failed to create activity");
      }

      const created = await res.json();
      const list = this.activitiesByTripId[tripId] || [];
      this.activitiesByTripId[tripId] = [created, ...list];

      return created;
    },

    async updateActivity(tripId, activityId, payload) {
      const headers = await this.authHeaders();

      const res = await fetch(
        `${API_BASE_URL}/api/trips/${tripId}/activities/${activityId}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.message || "Failed to update activity");
      }

      const updated = await res.json();
      const list = this.activitiesByTripId[tripId] || [];

      this.activitiesByTripId[tripId] = list.map((a) =>
        a.id === activityId ? updated : a
      );

      return updated;
    },

    async deleteActivity(tripId, activityId) {
      const headers = await this.authHeaders();

      const res = await fetch(
        `${API_BASE_URL}/api/trips/${tripId}/activities/${activityId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.message || "Failed to delete activity");
      }

      const list = this.activitiesByTripId[tripId] || [];
      this.activitiesByTripId[tripId] = list.filter((a) => a.id !== activityId);
    },
  },
});
