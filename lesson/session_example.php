<?php
session_start(); // 세션 시작

// 세션 설정
if (isset($_GET['action']) && $_GET['action'] == 'set') {
    $_SESSION['user'] = 'Test'; // 세션에 데이터 저장
    echo "세션이 설정되었습니다. <a href='session_example.php?action=get'>세션 확인</a>";
    exit;
}

// 세션 읽기
if (isset($_GET['action']) && $_GET['action'] == 'get') {
    if (isset($_SESSION['user'])) {
        echo "저장된 세션: " . $_SESSION['user'] . "<br>";
        echo "현재 세션 ID: " . session_id() . "<br>";
    } else {
        echo "세션이 없습니다.<br>";
    }
    echo "<a href='session_example.php?action=delete'>세션 삭제</a>";
    exit;
}

// 세션 삭제
if (isset($_GET['action']) && $_GET['action'] == 'delete') {
    session_unset(); // 모든 세션 변수 제거
    // session_destroy(); // 세션 종료
    echo "세션이 삭제되었습니다. <a href='session_example.php'>처음으로</a>";
    exit;
}
?>