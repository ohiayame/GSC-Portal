<?php
session_start();


// 세션에 사용자 정보가 없으면 로그인 페이지로 이동
if (!isset($_SESSION['name']) || !isset($_SESSION['role'])) {
    header('Location: login.php');
    exit;
}else{
    echo "error";
}

// 현재 사용자 정보
$name = $_SESSION['name'];
$role = $_SESSION['role'];
