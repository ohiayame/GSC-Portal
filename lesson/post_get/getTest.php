<?php
$users = [
    ["stdNumber" => 1234, "pass" => "aaa", "permission" => "student"],
    ["stdNumber" => 5678, "pass" => "asd",  "permission" => "teacher"]
];

$getNumber = $_GET['stdNumber'];
// echo "$getNumber";

for ($i = 0; count($users) > $i; $i++){
    if ($users[$i]['stdNumber'] == $getNumber){
        $getNumber = $i;
        break;
    }
}

$user = $users[$getNumber];
echo "학번: " . htmlspecialchars($user['stdNumber']) . "<br>";
echo "패스워드: " . htmlspecialchars($user['pass']) . "<br>";
echo "권한: " . htmlspecialchars($user['permission']) . "<br>";


?>