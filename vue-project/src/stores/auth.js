import { defineStore } from 'pinia';

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

                console.log("🔍 서버 응답 데이터:", data); // 서버에서 받은 전체 응답 데이터 출력

                if (data.user) {
                    this.user = data.user;
                    this.isAuthenticated = true;
                    console.log("✅ 사용자 정보 설정됨:", this.user); // user가 설정될 때 로그 출력
                } else {
                    this.user = null;
                    this.isAuthenticated = false;
                    console.log("❌ 사용자 정보 없음 → 로그아웃 상태"); // user가 없을 때 로그 출력
                  }
            } catch (error) {
                this.user = null;
                this.isAuthenticated = false;
                console.error("⚠ fetchUser() 오류 발생:", error); // 오류 발생 시 로그 출력
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

                console.log("✅ 로그아웃 완료: 사용자 정보 초기화됨");

                // ✅ 로그아웃 후 0.5초 후 fetchUser 실행하여 로그인 버튼 갱신
                setTimeout(() => {
                    console.log("🔄 fetchUser() 실행하여 로그인 상태 갱신");
                    this.fetchUser();
                }, 500);

            } catch (error) {
                console.error("⚠ 로그아웃 오류:", error);
            }
        },
        async registerUser(form) {
          try {
              console.log("📨 회원가입 요청 전송:", form);

              const response = await fetch("http://localhost:3001/auth/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(form),
              });

              const data = await response.json();
              console.log("🔍 회원가입 응답:", data);

              if (response.ok) {
                  alert("✅ 회원가입이 완료되었습니다! 로그인 후 이용해주세요.");
                  window.location.href = "/";  // 로그인 페이지 또는 메인 페이지로 이동
              } else {
                  alert("❌ 회원가입 실패: " + data.error);
              }
          } catch (error) {
              console.error("⚠ 회원가입 요청 오류:", error);
          }
      }
    }
});
