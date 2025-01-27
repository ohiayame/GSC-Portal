<?php
    // 데이터베이스 연결 정보
    $host = 'localhost';
    $user = 'root';
    $pass = 'gsc1234!@#$';
    $dbname = 'me_database';

    $conn = new mysqli($host, $user, $pass, $dbname);

    if ($conn->connect_error) {
        die('DB 연결 실패: ' . $conn->connect_error);
    }

    // POST 요청으로 전달받은 데이터
    $id = intval($_POST['id']);
    $title = $conn->real_escape_string($_POST['title']);
    $writer = $conn->real_escape_string($_POST['writer']);
    $content = $conn->real_escape_string($_POST['content']);

    // 데이터베이스 업데이트 쿼리 실행
    $sql = "UPDATE Board SET title='$title', writer='$writer', content='$content' WHERE id=$id";

    if ($conn->query($sql) === TRUE) {
        echo "게시물이 성공적으로 수정되었습니다.";
        echo "<br><a href='page.php?id=$id'>홈으로 돌아가기</a>";
    } else {
        echo "수정 실패: " . $conn->error;
    }

    // 데이터베이스 연결 종료
    $conn->close();
?>
