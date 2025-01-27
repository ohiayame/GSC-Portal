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

    // GET 요청으로 전달받은 id
    $id = intval($_GET['id']);

    if ($id) {
        // 삭제 쿼리 실행
        $sql = "DELETE FROM Board WHERE id = $id";

        if ($conn->query($sql) === TRUE) {
            echo "게시물이 성공적으로 삭제되었습니다.";
            echo "<br><a href='page.php'>홈으로 돌아가기</a>";
        } else {
            echo "삭제 실패: " . $conn->error;
        }
    } else {
        echo "잘못된 요청입니다.";
    }

    // 데이터베이스 연결 종료
    $conn->close();
?>
