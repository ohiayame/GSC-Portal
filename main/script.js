document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.querySelector(".btn.login");
    const signupButton = document.querySelector(".btn.signup");

    loginButton.addEventListener("click", async (event) => {
        event.preventDefault();

        const stdNumber = document.querySelector("#stdNumber").value;
        const pass = document.querySelector("#pass").value;
        const permission = document.querySelector("#permission").value;
        
        if (permission === "학생") {
            permission = "user";
        } else if (permission === "관리자") {
            permission = "admin";
        }

        if (!stdNumber || !pass) {
            alert("학번과 비밀번호를 입력해주세요."); // 입력 검증
            return;
        }

        try {
            // 서버로 데이터 전송
            const response = await fetch("login.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ stdNumber, pass, permission }), // pass로 수정
            });

            // 응답 처리
            const result = await response.json();

            if (result.success) {
                alert("로그인 성공!");
                window.location.href = "../menu/index.html";
            } else {
                alert(result.message || "로그인 실패: 회원가입을 진행해주세요.");
            }
        } catch (error) {
            console.error("서버 오류:", error);
            alert("서버와 통신 중 문제가 발생했습니다.");
        }
    });

    signupButton.addEventListener("click", () => {
        window.location.href = "../account/create_account.html";
    });
});
