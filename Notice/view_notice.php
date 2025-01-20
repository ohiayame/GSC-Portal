<?php
$host = 'localhost'; // DB 호스트
$user = 'root'; // DB 사용자명
$pass = 'gsc1234!@#$'; // DB 비밀번호
$dbname = 'me_database'; // DB 이름

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die('DB 연결 실패: ' . $conn->connect_error);
}

// 공지사항 ID 가져오기
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id > 0) {
    $query = "SELECT title, target, DATE_FORMAT(date, '%Y-%m-%d') AS date, writer, contents 
              FROM notice WHERE noticeID = ?";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        die(json_encode(['error' => '쿼리 준비 실패: ' . $conn->error]));
    }

    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $notice = $result->fetch_assoc();
        echo json_encode($notice);
    } else {
        die(json_encode(['error' => '공지사항을 찾을 수 없습니다. ID: ' . $id]));
    }
} else {
    echo json_encode(['error' => '유효하지 않은 공지사항 ID입니다.']);
}

$conn->close();
?>