import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false
    }),
    actions: {
        async loginWithGoogle() {
        const user = await signInWithGoogle();
        this.user = user;
        this.isAuthenticated = true;

        localStorage.setItem('token', user.token);
        localStorage.setItem('userProfile', JSON.stringify(user));

        return user;
        },
        logout() {
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('userProfile');
        }
    }
});
