// stores/user.js
import { defineStore } from 'pinia'
const config = useRuntimeConfig();
export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    hasPaid: (state) => state.user?.hasPaid || false,
    isOnboarded: (state) => state.user?.isOnboarded || false,
    isRegistered: (state) => state.user?.isRegistered || false,
  },

  actions: {
    async fetchProfile() {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.user = null;
          return null;
        }

        const response = await fetch(`${config.public.URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          
  withCredentials: true, // if you use cookies or sessions

        });

        if (response.ok) {
          const userData = await response.json();
          this.user = userData;
          console.log('Fetched user:', userData);

          return userData;
        } else {
          // Handle unauthorized or other errors
          localStorage.removeItem('token');
          this.user = null;
          this.error = 'Authentication failed';
          return null;
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      localStorage.removeItem('token');
      this.user = null;
    }
  }
})