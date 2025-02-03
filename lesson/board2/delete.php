<?php
require 'db_connect.php';

$id = intval($_GET['id']);

if ($id) {
    // 삭제 쿼리 실행
    $sql = "DELETE FROM board2 WHERE id = $id";
    if ($conn->query($sql)){
        header('Location: homepage.php');
    }
}else {
    echo "잘못된 요청입니다.";
}

// 데이터베이스 연결 종료
$conn->close();
?>
