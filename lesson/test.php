<?php
$num = "790608-2552416";
$numbers = str_split($num); // 한 글자 씩 리스트에 저장장

if (count($numbers) < 0 || count($numbers) > 14){ // 길이 13자리(- 포함함)
    echo "숫자 13자리로!";
}

//  생년월일
// if ($numbers[2] < 0 || $numbers[2] > 1){
//     echo "유효하지 않습니다 (월)";
//     if ($numbers[2] == 1 && $numbers[3] > 2){
//         echo "유효하지 않습니다 (월월)";
//     }
// }

// if ($numbers[4] < 0 || $numbers[4] > 3){
//     echo "유효하지 않습니다 (일)";
//     if ($numbers[4] == 3 && $numbers[5] > 1){
//         echo "유효하지 않습니다 (일일일)";
//     }
// }
$month = $numbers[2].$numbers[3];
if ($month < 1 || $month > 12 ){
    echo "유효하지 않습니다 (월)";
}
$date = $numbers[4].$numbers[5];
if ($month < 1 || $month > 31 ){
    echo "유효하지 않습니다 (일)";
}

if ($numbers[7] < 0 || $numbers[7] > 4){
    echo "유효하지 않습니다 (연도)";
}

// 12개
$mask = [ 2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
$sum = 0;
for ($i = 0, $n = 0; count($mask)-1 >= $i ; $i++, $n++){
    // - pass
    if ($i == 6){
        $n++;
    }
    $sum += $mask[$i] * $num[$n];
   // echo "$sum\n";
}
$re = $sum % 11;
if ($re == 10){
    $re = 0;
}
$result = 11 - $re;
// echo "$result";

// 마지막 숫자 확인인
if ($result != $numbers[13]){
    echo("$result");
}

// 출력
for ($i = 0; count($numbers)-1 >= $i; $i++){
    if ($i < 7){
        echo "$numbers[$i]";
    }else{
        echo "*";
    }
}
?>