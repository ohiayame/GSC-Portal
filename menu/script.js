document.addEventListener("DOMContentLoaded", () => {
    fetch("../user_info.php")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const userInfo = data.userInfo;

                // 사용자 정보를 화면에 표시
                document.getElementById("welcomeMessage").textContent =
                    `${userInfo.name} 님! 안녕하세요!`;
            } else {
                alert(data.message);
                window.location.href = "../main/login.html"; // 로그인 페이지로 리다이렉트
            }
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
            alert("사용자 정보를 가져오는 데 실패했습니다.");
        });
});