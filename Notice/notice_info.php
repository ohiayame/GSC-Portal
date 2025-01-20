<?php
$host = 'localhost'; // DB 호스트
$user = 'root'; // DB 사용자명
$pass = 'password'; // DB 비밀번호
$dbname = 'your_database'; // DB 이름

$conn = new mysqli($host, $user, $pass, $dbname);

// 연결 확인
if ($conn->connect_error) {
    die('DB 연결 실패: ' . $conn->connect_error);
}

// 페이지네이션 처리
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$itemsPerPage = isset($_GET['itemsPerPage']) ? intval($_GET['itemsPerPage']) : 5;
$offset = ($page - 1) * $itemsPerPage;

// 공지사항 목록 가져오기
$sql = "SELECT noticeID, title, date FROM notice ORDER BY date DESC LIMIT $itemsPerPage OFFSET $offset";
$result = $conn->query($sql);

$notices = [];
while ($row = $result->fetch_assoc()) {
    $notices[] = $row;
}

// 총 공지사항 개수
$countResult = $conn->query("SELECT COUNT(*) AS total FROM notice");
$totalCount = $countResult->fetch_assoc()['total'];
$totalPages = ceil($totalCount / $itemsPerPage);

// JSON으로 반환
echo json_encode([
    'notices' => $notices,
    'totalPages' => $totalPages
]);

$conn->close();
?>
