<?php
$host = 'localhost'; // DB 호스트
$user = 'root'; // DB 사용자명
$pass = 'gsc1234!@#$'; // DB 비밀번호
$dbname = 'me_database'; // DB 이름

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die('DB 연결 실패: ' . $conn->connect_error);
}
session_start();
$name = $_GET['name'];
$pass = $_GET['pass'];

$sql = "SELECT * FROM bulletinBoard WHERE name = '$name' AND password = '$pass'";
$result = $conn->query($sql); //  쿼리를 실행 (반환: TRUE/FALSE)

if ($result->num_rows > 0) { // 조회된 행(row)의 개수를 반환
    $_SESSION['user'] = $name;
    echo "로그인 성공";
    echo "<a href='page.php'>홈으로 이동</a>";
    
} else {
    echo "회원정보가 없거나, 입력이 틀렸습니다.<br>";
    echo "<a href='signin.html'>가입</a><br>";
    echo "<a href='login.html'>돌아가기</a>";

}

?>