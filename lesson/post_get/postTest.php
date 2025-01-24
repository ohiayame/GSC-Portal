<?php
// 데이터 가져오기 
$stdNumber = $_POST['stdNumber'];
$pass = $_POST['pass'];
$permission = $_POST['permission'];

if ($stdNumber && $pass && $permission) {
    echo "학번 : ". $stdNumber . "<br>";
    echo "비밀번호 : ". $pass . "<br>";
    echo "권한 : ". $permission . "<br>";
}else{
    echo "error";
}

?>