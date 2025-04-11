import { nextTick } from 'vue';

export function renderGoogleLoginButton() {
  nextTick(() => {
    const googleLoginDiv = document.getElementById("google-login-btn");
    if (googleLoginDiv) {
      googleLoginDiv.innerHTML = "";
      google.accounts.id.renderButton(googleLoginDiv, {
        theme: "outline",
        size: "large",
        shape: "pill"
      });
    }
  });
}

export function initializeGoogleLogin(clientId, callbackFn) {
  window.onload = function () {
    console.log("✅ Google 로그인 버튼 로딩 완료");
    google.accounts.id.initialize({
      client_id: clientId,
      callback: callbackFn,
      ux_mode: "popup",
    });
    renderGoogleLoginButton();
  };
}
