import { defineStore } from "pinia";
import { useAuthStore } from "@/stores/useAuthStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function authHeadersIfAny() {
  const authStore = useAuthStore();
  const token = await authStore.getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export const useTripStore = defineStore("trips", {
  state: () => ({
    trips: [],
    loading: false,
    error: null,

    activitiesByTripId: {},
    activitiesLoadingByTripId: {},
    activitiesErrorByTripId: {},
  }),

  actions: {
    // GET (public) dar dacă ești logat trimite token => primești doar trips-urile tale
    async fetchTrips() {
      this.loading = true;
      this.error = null;

      try {
        const headers = await authHeadersIfAny();

        const res = await fetch(`${API_BASE}/api/trips`, {
          headers,
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || "Failed to fetch trips");
        }

        this.trips = await res.json();
      } catch (e) {
        this.error = e.message || "Failed to fetch trips";
      } finally {
        this.loading = false;
      }
    },

    async createTrip(payload) {
      this.error = null;

      const headers = {
        "Content-Type": "application/json",
        ...(await authHeadersIfAny()),
      };

      const res = await fetch(`${API_BASE}/api/trips`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to create trip");
      }

      const created = await res.json();
      // re-fetch ca să fie sigur sincron cu user filtering
      await this.fetchTrips();
      return created;
    },

    async updateTrip(id, payload) {
      this.error = null;

      const headers = {
        "Content-Type": "application/json",
        ...(await authHeadersIfAny()),
      };

      const res = await fetch(`${API_BASE}/api/trips/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update trip");
      }

      const updated = await res.json();
      await this.fetchTrips();
      return updated;
    },

    async deleteTrip(tripId) {
      this.error = null;

      const headers = await authHeadersIfAny();

      const res = await fetch(`${API_BASE}/api/trips/${tripId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok && res.status !== 204) {
        const msg = await res.text();
        throw new Error(msg || "Failed to delete trip");
      }

      await this.fetchTrips();
    },

    // ACTIVITIES
    async fetchActivities(tripId) {
      this.activitiesLoadingByTripId[tripId] = true;
      this.activitiesErrorByTripId[tripId] = null;

      try {
        const headers = await authHeadersIfAny();

        const res = await fetch(`${API_BASE}/api/trips/${tripId}/activities`, {
          headers,
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || "Failed to fetch activities");
        }

        const data = await res.json();
        this.activitiesByTripId[tripId] = data;
      } catch (e) {
        this.activitiesErrorByTripId[tripId] =
          e.message || "Failed to fetch activities";
      } finally {
        this.activitiesLoadingByTripId[tripId] = false;
      }
    },

    async createActivity(tripId, payload) {
      const headers = {
        "Content-Type": "application/json",
        ...(await authHeadersIfAny()),
      };

      const res = await fetch(`${API_BASE}/api/trips/${tripId}/activities`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to create activity");
      }

      const created = await res.json();
      await this.fetchActivities(tripId);
      return created;
    },

    async updateActivity(tripId, activityId, payload) {
      const headers = {
        "Content-Type": "application/json",
        ...(await authHeadersIfAny()),
      };

      const res = await fetch(
        `${API_BASE}/api/trips/${tripId}/activities/${activityId}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update activity");
      }

      const updated = await res.json();
      await this.fetchActivities(tripId);
      return updated;
    },

    async deleteActivity(tripId, activityId) {
      const headers = await authHeadersIfAny();

      const res = await fetch(
        `${API_BASE}/api/trips/${tripId}/activities/${activityId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to delete activity");
      }

      await this.fetchActivities(tripId);
    },
  },
});
