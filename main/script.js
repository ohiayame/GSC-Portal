document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.querySelector(".btn.login");
    const signupButton = document.querySelector(".btn.signup");

    loginButton.addEventListener("click", (event) => {
        event.preventDefault();
        alert("로그인 버튼이 클릭되었습니다.");
        window.location.href = "../menu/index.html";
    });

    signupButton.addEventListener("click", (event) => {
        event.preventDefault();
        alert("회원가입 버튼이 클릭되었습니다.");
        window.location.href = "../menu/index.html";
    });

});
