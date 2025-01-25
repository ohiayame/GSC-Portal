<?php
$host = 'localhost'; // DB 호스트
$user = 'root'; // DB 사용자명
$pass = 'gsc1234!@#$'; // DB 비밀번호
$dbname = 'me_database'; // DB 이름

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die('DB 연결 실패: ' . $conn->connect_error);
}

$name = $_GET['name'];
$age = $_GET['age'];

$sql = "SELECT * FROM test WHERE name = '$name' AND age = $age";
$result = $conn->query($sql); //  쿼리를 실행 (반환: TRUE/FALSE)

if ($result->num_rows > 0) { // 조회된 행(row)의 개수를 반환
    while($row = $result->fetch_assoc()) { // 한 행씩 가져옴
        echo "ID: " . $row["id"] . " - Name: " . $row["name"] . " - Age: " . $row["age"] . "<br>";
        echo "로그인 가능";
    }
} else {
    echo "0 results";
    echo "<a href='post.html'>가입</a>";
}

?>