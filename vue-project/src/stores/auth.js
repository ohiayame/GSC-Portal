import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        accessToken: localStorage.getItem("auth_token") || null,
        pendingUsers: [],
    }),
    actions: {
        async fetchUser() {
            try {
              const token = this.accessToken;  // ✅ 저장된 토큰 사용
              console.log("token:", token)
                if (!token) {
                    console.warn("🚨 [AUTH] 저장된 토큰 없음 → 로그아웃 상태 유지");
                    this.user = null;
                    this.isAuthenticated = false;
                    return;
                }

                const response = await fetch("http://localhost:3001/auth/user", {
                  headers: { Authorization: `Bearer ${token}` },
                  credentials: "include"
                });
                const data = await response.json();

                console.log("🔍 서버 응답 데이터:", data); // 서버에서 받은 전체 응답 데이터 출력

                if (data.user) {
                    this.user = data.user;
                    this.isAuthenticated = true;
                    console.log("✅ 사용자 정보 설정됨:", this.user); // user가 설정될 때 로그 출력
                    if (data.user.approved === 0) {
                      console.warn("🚨 승인 대기 중인 사용자 → 페이지 접근 제한");
                    }
                } else {
                  this.logout();
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
                this.accessToken = null;
                localStorage.removeItem("auth_token");

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
      },
      setUser(user) {
        this.user = user;
        this.isAuthenticated = true;
      },
      async login(data) {
        console.log("🔐 [LOGIN] 서버 응답 데이터:", data);

        if (data.token) {
          this.user = data.user;
          this.isAuthenticated = true;
          this.accessToken = data.token;
          localStorage.setItem("auth_token", data.token);  // ✅ 토큰 저장

          console.log("✅ [LOGIN] 로그인 성공 → 사용자 정보 저장 완료");
        }
    },



    async fetchPendingUsers() {
      try {
        const res = await fetch("http://localhost:3001/auth/all-users");
        const data = await res.json();
        this.pendingUsers = data;
        console.log("회원 데이터", data)

      } catch (err) {
        console.error("❌ 승인 대기 사용자 불러오기 실패", err);
      }
    },

    // ✅ 사용자 승인
    async approveUser(id) {
      await fetch(`http://localhost:3001/auth/approve-user/${id}`, {
        method: "PUT"
      });
      await this.fetchPendingUsers(); // 목록 새로고침
    },

    // ✅ 사용자 거절
    async rejectUser(id) {
      await fetch(`http://localhost:3001/auth/reject-user/${id}`, {
        method: "DELETE" });
      await this.fetchPendingUsers();
    },

    async updateRole(id, role) {
      try {
        await fetch(`http://localhost:3001/auth/add-role/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ role })  // 반드시 객체로 감싸야 함!!
        });
        console.log(" role 전송 완료  ")
        await this.fetchPendingUsers(); // 목록 새로고침
      } catch (err) {
        console.error("❌ 역할 업데이트 실패:", err);
      }
    },


    async loginWithGoogleCredential(credential) {
      try {
        const res = await fetch("http://localhost:3001/auth/google/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });

        const data = await res.json();
        if (!res.ok) {
          // ✅ 서버에서 403 또는 500 등 에러 응답일 때
          console.error("❌ 서버 오류 응답:", data.error);
          return { status: "error", error: data.error };
        }

        if (data.success) {
          this.login(data); // ✅ 로그인 상태 저장
          return { status: "success" };
        } else if (data.redirect) {
          return {
            status: "redirect",
            redirect: data.redirect,
            email: data.email,
            name: data.name,
          };
        } else {
          return { status: "pending" };
        }
      } catch (error) {
        console.error("로그인 요청 오류:", error);
        return { status: "error", error };
      }
    }


  }
});
