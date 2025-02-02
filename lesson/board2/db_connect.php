<?php
    $host = 'localhost';       // DB 호스트
    $user = 'root';            // DB 사용자명
    $pass = 'gsc1234!@#$';     // DB 비밀번호
    $dbname = 'me_database';   // DB 이름

    // 데이터베이스 연결 생성
    $conn = new mysqli($host, $user, $pass, $dbname);

    // 연결 오류 확인
    if ($conn->connect_error) {
        die('DB 연결 실패: ' . $conn->connect_error);
    }

?>
