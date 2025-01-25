<?php
// 쿠키 설정
if (isset($_GET['action']) && $_GET['action'] == 'set') {
    setcookie('user', 'John Doe', time() + 600, '/'); // 쿠키 10분간 유효
    echo "쿠키가 설정되었습니다. <a href='cookie_example.php?action=get'>쿠키 확인</a>";
    exit;
}

// 쿠키 읽기
if (isset($_GET['action']) && $_GET['action'] == 'get') {
    if (isset($_COOKIE['user'])) {
        echo "저장된 쿠키: " . $_COOKIE['user'] . "<br>";
    } else {
        echo "쿠키가 없습니다.<br>";
    }
    echo "<a href='cookie_example.php?action=delete'>쿠키 삭제</a>";
    exit;
}

// 쿠키 삭제
if (isset($_GET['action']) && $_GET['action'] == 'delete') {
    setcookie('user', '', time() - 3600, '/'); // 만료 시간 과거로 설정
    echo "쿠키가 삭제되었습니다. <a href='cookie_example.php'>처음으로</a>";
    exit;
}
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

?>

