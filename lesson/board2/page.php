<?php
    require 'db_connect.php';   
    session_start();
    $role = $_SESSION['role'];

    // 페이징을 위한 기본 설정
    $limit = 10; // 한 페이지에 표시할 게시물 수
    $page = intval($_GET['page'] ?? 1); // 현재 페이지 번호, 기본값 1
    if ($page < 1) $page = 1; // 페이지가 1보다 작을 수 없음
    $offset = ($page - 1) * $limit; // 데이터 조회 시작점 계산

    // 검색 조건 처리
    $search = $_GET['search'] ?? "";

    if ($search == "") {
        $sql = "SELECT * FROM board2 ORDER BY date DESC LIMIT $limit OFFSET $offset";
        $count_sql = "SELECT COUNT(*) AS total FROM board2"; // 전체 게시물 수
    } else {
        $sql = "SELECT * FROM board2 
                WHERE contents LIKE '%$search%' OR title LIKE '%$search%' 
                ORDER BY date DESC LIMIT $limit OFFSET $offset";
        $count_sql = "SELECT COUNT(*) AS total FROM board2 
                        WHERE contents LIKE '%$search%' OR title LIKE '%$search%'";
    }

    // 쿼리 실행
    $result = $conn->query($sql);
    $count_result = $conn->query($count_sql);

    // 전체 게시물 수 계산
    $total = $count_result->fetch_assoc()['total'];
    $total_pages = ceil($total / $limit); // 전체 페이지 수( ceil: 올림연산)
    
    $contents=[];
    // 게시물 출력
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $offset++;
            $row['Num'] = $offset;
            $contents[] = $row;
        }
        
        $_SESSION['contents'] = $contents;

    } else {
        echo "게시물 없음";
    }

    $conn->close();
?>
