<?php
$host = 'localhost'; // DB 호스트
$user = 'root'; // DB 사용자명
$pass = 'gsc1234!@#$'; // DB 비밀번호
$dbname = 'me_database'; // DB 이름

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die('DB 연결 실패: ' . $conn->connect_error);
}

$name = $_POST['name'];
$pass = $_POST['pass'];

$sql = "INSERT INTO bulletinBoard (name, password) VALUES ('$name', '$pass')";
if ($conn->query($sql) === TRUE) {
    echo "등록완료";
    echo "<a href='login.html'>로그인</a>";
} else {
    header('Location: ' . $_SERVER['HTTP_REFERER']);
    exit;
}
?>