<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header("Content-Type: application/json");

$host = "localhost";
$dbname = "me_database";
$username = "root";
$password = "gsc1234!@#$";

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "데이터베이스 연결 실패: " . $conn->connect_error]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["stdNumber"]) || !isset($data["pass"]) || !isset($data["permission"])) { // pass로 수정
    echo json_encode(["success" => false, "message" => "입력값이 부족합니다."]);
    exit();
}

$stdNumber = $data["stdNumber"];
$pass = $data["pass"]; // pass로 수정
$permission = $data["permission"];

$query = "SELECT * FROM accounts WHERE stdNumber = ? AND permission = ?";
$stmt = $conn->prepare($query);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL 쿼리 준비 실패: " . $conn->error]);
    exit();
}

$stmt->bind_param("ss", $stdNumber, $permission);
$stmt->execute();
$result = $stmt->get_result();

// 디버깅: 조건 값 출력
error_log("stdNumber: $stdNumber, permission: $permission");

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // 비밀번호 검증
    if (password_verify($pass, $user["pass"])) {
        $_SESSION["user"] = [
            "stdNumber" => $user["stdNumber"],
            "name" => $user["name"],
            "address" => $user["address"],
            "permission" => $user["permission"],
            "MgrCode" => $user["MgrCode"]
        ];
        echo json_encode(["success" => true, "message" => "로그인 성공"]);
    } else {
        echo json_encode(["success" => false, "message" => "비밀번호가 틀렸습니다."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "학번, 비밀번호, 권한이 맞지 않습니다."]);
}

$stmt->close();
$conn->close();
?>
