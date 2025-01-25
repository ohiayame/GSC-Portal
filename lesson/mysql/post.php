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
$age = $_POST['age'];

$sql = "INSERT INTO test (name, age) VALUES ('$name', $age)";
if ($conn->query($sql) === TRUE) {
    echo "New record created successfully<br>";
    echo "<a href='get.html'>로그인인</a>";
} else {
    echo "Error: " . $conn->error . "<br>";
}
?>