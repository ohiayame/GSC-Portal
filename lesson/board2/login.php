<?php
//error_reporting(E_ALL);
//ini_set('display_errors', 1);

//var_dump($_POST);

//echo "요청 방식: " . $_SERVER['REQUEST_METHOD'] . "<br>";
//echo "현재 경로: " . $_SERVER['PHP_SELF'] . "<br>";
//echo $_POST['stdNum']."  /    ".$_POST['password'];

require 'db_connect.php';

session_start();

$stdNum = isset($_POST['stdNum']) ? $_POST['stdNum'] : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

// 디버깅용 출력
//echo "요청 방식: " . $_SERVER['REQUEST_METHOD'] . "<br>";
//echo "입력된 학번: " . htmlspecialchars($stdNum) . "<br>";
//echo "입력된 비밀번호: " . htmlspecialchars($password) . "<br>";

// SQL 실행
$sql = "SELECT * FROM users WHERE stdNum='$stdNum' AND password='$password';";
$result = $conn->query($sql);

//$isTrue = false;
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();

    $_SESSION['user'] = $row['name'];
    $_SESSION['role'] = $row['role'];

    header('Location: homepage.php');
    exit;
} else {
    echo "회원정보가 없거나, 입력이 틀렸습니다.<br>";
    echo "<a href='register.html'>회원가입하기</a><br>";
    echo "<a href='login.html'>로그인으로 돌아가기</a>";
}

//if($isTrue){
//    header('Location: homepage.php');
//    exit;
//}

?>
