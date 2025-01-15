<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>시간표</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>시간표</h1>
    <table>
        <thead>
            <tr>
                <th class="time-column">교시</th>
                <th>월요일</th>
                <th>화요일</th>
                <th>수요일</th>
                <th>목요일</th>
                <th>금요일</th>
            </tr>
        </thead>
        <tbody>
            <?php 
            $subjects = [
                1 => ['월요일' => '국어', '화요일' => '수학', '수요일' => '영어', '목요일' => '체육', '금요일' => '미술'],
                2 => ['월요일' => '사회', '화요일' => '과학', '수요일' => '수학', '목요일' => '국어', '금요일' => '영어'],
                3 => ['월요일' => '음악', '화요일' => '사회', '수요일' => '체육', '목요일' => '영어', '금요일' => '수학'],
                4 => ['월요일' => '영어', '화요일' => '미술', '수요일' => '체육', '목요일' => '과학', '금요일' => '사회'],
                5 => ['월요일' => '수학', '화요일' => '영어', '수요일' => '국어', '목요일' => '체육', '금요일' => '미술'],
                6 => ['월요일' => '국어', '화요일' => '음악', '수요일' => '과학', '목요일' => '영어', '금요일' => '수학'],
                7 => ['월요일' => '체육', '화요일' => '수학', '수요일' => '영어', '목요일' => '사회', '금요일' => '미술']
            ];

            for ($period = 1; $period <= 7; $period++) {
                echo "<tr>";
                echo "<td class='time-column'>{$period}교시</td>";
                foreach (['월요일', '화요일', '수요일', '목요일', '금요일'] as $day) {
                    // 각 교시, 요일에 맞는 과목 표시
                    echo "<td>" . (isset($subjects[$period][$day]) ? $subjects[$period][$day] : '없음') . "</td>";
                }
                echo "</tr>";
            }
            ?>
        </tbody>
    </table>
</body>
</html>
