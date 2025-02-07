<?php
    require 'db_connect.php';
    session_start();
    // POST 요청으로 전달받은 데이터
    $id = $conn->real_escape_string($_POST['id']);
    $title = $conn->real_escape_string($_POST['title']);
    $writer = $conn->real_escape_string($_SESSION['name']);
    $contents = $conn->real_escape_string($_POST['contents']);

    // 데이터베이스 업데이트 쿼리 실행
    $sql = "UPDATE board2 SET title='$title', writer='$writer', contents='$contents' WHERE id=$id";

    if ($conn->query($sql) === TRUE) {
        // 4. 파일 업로드 처리
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            // 파일 경로 및 이름 설정
            $uploadDir = 'uploads/' . $id . '/';
            $fileName = basename($_FILES['file']['name']);
            $uploadPath = $uploadDir . uniqid() . "_" . $fileName;

            // 파일 이동
            if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadPath)) {
                // 파일 정보 DB 저장
                $filesql = "UPDATE attachments SET fileName='$fileName', filePath='$uploadPath' WHERE noticeID='$id'";
                $conn->query($filesql);
                echo "파일 업로드 성공!";
                header("Location: homepage.php");
            } else {
                echo "파일 업로드에 실패했습니다.";
            }
        } else {
            echo "파일 업로드 중 오류가 발생했습니다.";
        }
        
    } else {
        echo "수정 실패: " . $conn->error;

    }

    // 데이터베이스 연결 종료
    $conn->close();
?>
