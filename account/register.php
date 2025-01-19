<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
// 데이터베이스 연결 설정
$host = "localhost"; // 데이터베이스 호스트
$username = "root"; // MySQL 사용자 이름
$password = "gsc1234!@#$"; // MySQL 비밀번호
$dbname = "me_database"; // 데이터베이스 이름

// MySQL 연결 생성
$conn = new mysqli($host, $username, $password, $dbname);

// 연결 오류 확인
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// POST로 전달된 데이터 가져오기
$stdNumber = $_POST['stdNumber'];
$name = $_POST['name'];
$address = $_POST['address'];
$pass = password_hash($_POST['pass'], PASSWORD_DEFAULT); // 비밀번호 해시 처리
$permission = $_POST['permission'];
$MgrCode = !empty($_POST['MgrCode']) ? $_POST['MgrCode'] : null;

// SQL 쿼리 작성
$sql = "INSERT INTO accounts (stdNumber, name, address, pass, permission, MgrCode)
        VALUES (?, ?, ?, ?, ?, ?)";

// Prepared Statement를 사용하여 SQL Injection 방지
$stmt = $conn->prepare($sql);

if (!$stmt) {
    die("SQL 준비 오류: " . $conn->error);
}

$stmt->bind_param("isssss", $stdNumber, $name, $address, $pass, $permission, $MgrCode);

// 쿼리 실행 및 결과 확인
if ($stmt->execute()) {
    // 회원가입 성공 시 로그인 페이지로 이동
    header("Location: ../main/main.html");
    exit(); // 코드 실행 중단
} else {
    // 오류가 발생한 경우 오류 메시지 출력
    echo "오류가 발생했습니다: " . $stmt->error;
}

// 연결 닫기
$stmt->close();
$conn->close();
?>
