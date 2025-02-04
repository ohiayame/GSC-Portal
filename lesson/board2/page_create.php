<?php
require 'db_connect.php';
// require 'session_manager.php';

// 1. 게시물 데이터 받기
$title = $_POST['title'] ?? "";
$contents = $_POST['contents'] ?? "";
$writer = isset($name) ? $name : "";

// 2. 게시물 삽입
$sql = "INSERT INTO board2 (title, contents, writer) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $title, $contents, $writer);

if ($stmt->execute()) {
    // 3. 마지막 삽입된 게시물 ID 가져오기
    $noticeID = $conn->insert_id;

    // 4. 파일 업로드 처리
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        // 파일 경로 및 이름 설정
        $uploadDir = 'uploads/' . $noticeID . '/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);  // 경로가 없을 경우 생성
        }

        $fileName = basename($_FILES['file']['name']);
        $uploadPath = $uploadDir . uniqid() . "_" . $fileName;

        // 파일 이동
        if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadPath)) {
            // 파일 정보 DB 저장
            $stmt = $conn->prepare("INSERT INTO attachments (noticeID, fileName, filePath) VALUES (?, ?, ?)");
            $stmt->bind_param("iss", $noticeID, $fileName, $uploadPath);
            $stmt->execute();
            echo "파일 업로드 성공!";
        } else {
            echo "파일 업로드에 실패했습니다.";
        }
    } else {
        echo "파일 업로드 중 오류가 발생했습니다.";
    }
} else {
    echo "게시물 등록 중 오류 발생: " . $conn->error;
}

// 5. 페이지 이동
header("Location: homepage.php");
$conn->close();
?>
