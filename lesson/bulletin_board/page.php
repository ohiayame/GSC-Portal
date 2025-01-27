<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <tittle>Document</tittle>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>타누키</h1>
    <a href='create.html'>작성</a>   
    <form action="page.php" method="GET">
        <input type="text" id="search" name="search" placeholder="search" value="<?php echo htmlspecialchars($_GET['search'] ?? ''); ?>">
        <button type="submit">조회</button>
    </form>

    <?php
        $host = 'localhost'; // DB 호스트
        $user = 'root'; // DB 사용자명
        $pass = 'gsc1234!@#$'; // DB 비밀번호
        $dbname = 'me_database'; // DB 이름

        $conn = new mysqli($host, $user, $pass, $dbname);

        if ($conn->connect_error) {
            die('DB 연결 실패: ' . $conn->connect_error);
        }

        // 페이징을 위한 기본 설정
        $limit = 10; // 한 페이지에 표시할 게시물 수
        $page = intval($_GET['page'] ?? 1); // 현재 페이지 번호, 기본값 1
        if ($page < 1) $page = 1; // 페이지가 1보다 작을 수 없음
        $offset = ($page - 1) * $limit; // 데이터 조회 시작점 계산

        // 검색 조건 처리
        $search = $_GET['search'] ?? "";

        if ($search == "") {
            $sql = "SELECT * FROM Board ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
            $count_sql = "SELECT COUNT(*) AS total FROM Board"; // 전체 게시물 수
        } else {
            $sql = "SELECT * FROM Board 
                    WHERE content LIKE '%$search%' OR title LIKE '%$search%' 
                    ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
            $count_sql = "SELECT COUNT(*) AS total FROM Board 
                            WHERE content LIKE '%$search%' OR title LIKE '%$search%'";
        }

        // 쿼리 실행
        $result = $conn->query($sql);
        $count_result = $conn->query($count_sql);

        // 전체 게시물 수 계산
        $total = $count_result->fetch_assoc()['total'];
        $total_pages = ceil($total / $limit); // 전체 페이지 수( ceil: 올림연산)

        // 게시물 출력
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $offset++;
                echo "<br><a href='view.php?id=".$row["id"] ."'>". $offset .
                " : 제목: " . $row["title"] . 
                " - 날짜: " . $row["created_at"] . "</a><br>";
            }
        } else {
            echo "게시물 없음";
        }

        // 페이지 네비게이션 (이전/다음 버튼)
        echo "<br><div>";

        // 이전 버튼
        if ($page > 1) {
            $prev_page = $page - 1;
            // &search= : 검색어 유지
            echo "<a href='page.php?page=$prev_page&search=".urlencode($search)."'>이전</a> ";
        }

        // 현재 페이지와 전체 페이지 번호 표시
        echo " 페이지 $page / $total_pages ";

        // 다음 버튼
        if ($page < $total_pages) {
            $next_page = $page + 1;
            echo "<a href='page.php?page=$next_page&search=".urlencode($search)."'>다음</a>";
        }

        echo "</div>";

        $conn->close();
    ?>

    <a href='logout.php'>로그아웃</a>    
</body>
</html>
