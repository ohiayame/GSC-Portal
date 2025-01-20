<?php
error_reporting(E_ALL); // 모든 에러를 표시
ini_set('display_errors', 1); // 에러를 화면에 출력

$servername = "localhost"; // 데이터베이스 서버 주소
$username = "root"; // 데이터베이스 사용자 이름
$password = "gsc1234!@#$"; // 데이터베이스 비밀번호
$dbname = "me_database"; // 사용할 데이터베이스 이름

// MySQL 데이터베이스 연결 생성
$conn = new mysqli($servername, $username, $password, $dbname);

if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}

// 세션 시작
session_start();

// 사용자 정보 가져오기
$writer = isset($_SESSION["user"]["name"]) ? $_SESSION["user"]["name"] : '알 수 없는 사용자';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'add') {
        $title = $_POST['title'] ?? '';
        $target = $_POST['target'] ?? '';
        $contents = $_POST['contents'] ?? ''; // contents 필드명 확인
        $date = date('Y-m-d');

        if (empty($title) || empty($target) || empty($contents)) {
            echo 'error: Missing required fields';
            exit;
        }

        $query =  "INSERT INTO notice (title, date, target, writer, contents) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sssss", $title, $date, $target, $writer, $contents);

        if ($stmt->execute()) {
            echo 'success';
        } else {
            echo 'error: ' . $stmt->error; // SQL 에러 출력
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $itemsPerPage = isset($_GET['itemsPerPage']) ? intval($_GET['itemsPerPage']) : 5;
    $offset = ($page - 1) * $itemsPerPage;
    $target = isset($_GET['target']) ? $_GET['target'] : ''; // 필터링 대상

    // 기본 쿼리 (대상 필터링이 없는 경우)
    $query = "SELECT noticeID, title, target, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM notice";

    // 대상 필터링 조건 추가
    if (!empty($target)) {
        $query .= " WHERE target = ?";
    }

    // 정렬 및 페이지네이션
    $query .= " ORDER BY date DESC LIMIT ?, ?";

    // SQL 준비 및 실행
    $stmt = $conn->prepare($query);

    if (!empty($target)) {
        $stmt->bind_param('sii', $target, $offset, $itemsPerPage);
    } else {
        $stmt->bind_param('ii', $offset, $itemsPerPage);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $notices = [];
    while ($row = $result->fetch_assoc()) {
        $notices[] = $row;
    }

    // 총 공지사항 개수 가져오기
    $countQuery = "SELECT COUNT(*) AS total FROM notice";
    if (!empty($target)) {
        $countQuery .= " WHERE target = ?";
    }

    $countStmt = $conn->prepare($countQuery);
    if (!empty($target)) {
        $countStmt->bind_param('s', $target);
    }

    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $totalCount = $countResult->fetch_assoc()['total'];
    $totalPages = ceil($totalCount / $itemsPerPage);

    // JSON 응답 반환
    echo json_encode([
        'notices' => $notices,
        'totalPages' => $totalPages
    ]);

    exit;
} else {
    echo 'Invalid request method';
    exit;
}
?>
