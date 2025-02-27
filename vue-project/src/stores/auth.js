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
                const response = await fetch("http://localhost:3001/auth/logout", {
                    method: "POST",
                    credentials: "include"
                });
        
                if (!response.ok) {
                    throw new Error("로그아웃 요청 실패");
                }
        
                this.user = null;
                this.isAuthenticated = false;
        
                // ✅ 로그아웃 후 0.5초 후 fetchUser 실행하여 로그인 버튼 갱신
                setTimeout(() => {
                    this.fetchUser();
                }, 500);
        
            } catch (error) {
                console.error("로그아웃 오류:", error);
            }
        }
    }
});
