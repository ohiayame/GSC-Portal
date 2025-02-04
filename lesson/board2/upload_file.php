<?php
require 'db_connect.php';
    // 파일 정보 확인
    $file = $_FILES['file'];
    $noticeID = $_GET['id'];  // 예시로 공지사항 ID 지정

    if ($file['error'] === UPLOAD_ERR_OK) {
        // 1. 파일 저장 경로 설정
        $uploadDir = 'uploads/'. $noticeID . '/';
        $fileName = basename($file['name']);
        $uploadPath = $uploadDir . uniqid() . "_" . $fileName;

        // 2. 파일 이동 (임시 디렉터리에서 실제 경로로 이동)
        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {

            $stmt = $conn->prepare("INSERT INTO attachments (noticeID, fileName, filePath) VALUES (?, ?, ?)");
            $stmt->bind_param("iss", $noticeID, $fileName, $uploadPath);
            $stmt->execute();

            echo "파일이 성공적으로 업로드되었습니다!";
            echo '<button onclick="history.back()">돌아가기</button>';
        } else {
            echo "파일 업로드에 실패했습니다.";
        }
    } else {
        echo "파일 업로드 중 오류가 발생했습니다.";
    }

?>
