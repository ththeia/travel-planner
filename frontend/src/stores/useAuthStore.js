import { defineStore } from "pinia";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/firebase";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loading: true,
    error: null,
  }),

  actions: {
    init() {
      onAuthStateChanged(auth, (user) => {
        this.user = user || null;
        this.loading = false;
      });
    },

    async register(email, password) {
      this.error = null;
      await createUserWithEmailAndPassword(auth, email, password);
    },

    async login(email, password) {
      this.error = null;
      await signInWithEmailAndPassword(auth, email, password);
    },

    async logout() {
      await signOut(auth);
    },

    async getToken() {
      if (!this.user) return null;
      return await this.user.getIdToken();
    },
  },
});
