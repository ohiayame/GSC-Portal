import { defineStore } from 'pinia';
import axios from 'axios';
import { nextTick } from 'vue';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        accessToken: null,
    }),
    actions: {
        async fetchUser() {
            try {
                const response = await fetch("http://localhost:3001/auth/user", { credentials: "include" });
                const data = await response.json();

                if (data.user) {
                    this.user = data.user;
                    this.isAuthenticated = true;
                } else {
                    this.user = null;
                    this.isAuthenticated = false;
                }
            } catch (error) {
                this.user = null;
                this.isAuthenticated = false;
            }
        },
        async logout() {
            try {
                await fetch("http://localhost:3001/auth/logout", {
                    method: "POST", 
                    credentials: "include" 
                });  // ✅ 서버에서 쿠키 삭제 요청
                this.user = null;
                this.isAuthenticated = false;
        
                // ✅ UI 즉시 반영 보장
                await nextTick();
            } catch (error) {
                console.error("로그아웃 오류:", error);
            }
        }
    }
});
