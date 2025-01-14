<?php
// POST 요청인지 확인
// if ($_SERVER['REQUEST_METHOD'] === 'POST') {
// 입력 데이터를 가져오고, HTML 특수 문자를 이스케이프
$target = htmlspecialchars($_POST['target'], ENT_QUOTES, 'UTF-8');

// 리다이렉트 대상 URL을 배열로 정의
$redirect_urls = [
    'yju' => 'https://gsc.yju.ac.kr',
];

// 대상 값이 배열에 있는지 확인
if (array_key_exists($target, $redirect_urls)) {
    // 리다이렉트 처리
    header("Location: " . $redirect_urls[$target]);
    exit;
} else {
    // 유효하지 않은 요청에 대한 응답
    echo "無効なリクエストです。";
}
// } else {
//     // POST 요청이 아닌 경우
//     echo "このページには直接アクセスできません。";
// }
?>
