<?php
require 'db_connect.php';
session_start();

// 입력값 설정
$stdNum = isset($_POST['stdNum']) ? $_POST['stdNum'] : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

// SQL 실행
$sql = "SELECT * FROM users WHERE stdNum='$stdNum' AND password='$password'";
$result = $conn->query($sql);
$result->num_rows > 0;
$row = $result->fetch_assoc();
// SQL 결과 확인 및 세션 설정
if ($row) {
    $_SESSION['name'] = $row['name'];
    $_SESSION['role'] = $row['role'];

    // 로그인 성공 시 homepage.php로 리다이렉트
    header('Location: homepage.php');
    exit;  // 이후 코드 실행 중단
} else {
    // 로그인 실패 메시지 출력
    // 헤더 전송 전에 출력이 필요하기 때문에 출력 버퍼 사용 가능
    ob_start();  // 출력 버퍼 시작

    echo "회원정보가 없거나, 입력이 틀렸습니다.<br>";
    echo "<a href='register.html'>회원가입하기</a><br>";
    echo "<a href='login.html'>로그인으로 돌아가기</a>";

    ob_end_flush();  // 출력 버퍼 종료 및 출력
    exit;  // 스크립트 종료
}

