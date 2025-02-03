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
        header("Location: homepage.php");
    } else {
        echo "수정 실패: " . $conn->error;

    }

    // 데이터베이스 연결 종료
    $conn->close();
?>
