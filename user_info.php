<?php
session_start();

// 사용자 정보 저장
if (!isset($_SESSION["user"])) {
    header("Location: main/login.html");
    exit();
}

echo json_encode([
    "success" => true,
    "userInfo" => $_SESSION["user"]
]);
?>
