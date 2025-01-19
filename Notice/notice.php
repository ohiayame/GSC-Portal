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

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'add') {
        $title = $_POST['title'] ?? '';
        $target = $_POST['target'] ?? '';
        $contents = $_POST['contents'] ?? ''; // contents 필드명 확인
        $date = date('Y-m-d');

        // 작성자 정보 (임의로 설정된 값 사용)
        $writer = '테스트 사용자';

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
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $itemsPerPage = isset($_GET['itemsPerPage']) ? (int)$_GET['itemsPerPage'] : 5;
    $offset = ($page - 1) * $itemsPerPage;

    // 데이터베이스에서 공지사항 가져오기
    $query = "SELECT title, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM notice ORDER BY date DESC LIMIT $offset, $itemsPerPage";
    $result = $conn->query($query);

    $notices = [];
    while ($row = $result->fetch_assoc()) {
        $notices[] = $row;
    }

    // 총 공지사항 개수 가져오기
    $totalQuery = "SELECT COUNT(*) AS total FROM notice";
    $totalResult = $conn->query($totalQuery);
    $totalRow = $totalResult->fetch_assoc();
    $totalPages = ceil($totalRow['total'] / $itemsPerPage);

    // JSON 형식으로 응답 반환
    echo json_encode(['notices' => $notices, 'totalPages' => $totalPages]);
    exit;
} else {
    echo 'Invalid request method';
    exit;
}
?>
