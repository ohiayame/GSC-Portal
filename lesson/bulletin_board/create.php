<?php
session_start();

$host = 'localhost'; // DB 호스트
$user = 'root'; // DB 사용자명
$pass = 'gsc1234!@#$'; // DB 비밀번호
$dbname = 'me_database'; // DB 이름

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die('DB 연결 실패: ' . $conn->connect_error);
}

$title = $_POST['title'];
$content = $_POST['content'];
$writer = $_SESSION['user'];

$sql = "INSERT INTO Board (title, content, writer) VALUES ('$title', '$content', '$writer')";
if ($conn->query($sql) === TRUE) {
    echo "등록 완료<br>";
    echo "<a href='page.php'>to back Home</a>";
} else {
    echo "Error: " . $conn->error . "<br>";
}
?>