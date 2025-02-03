<?php
    require 'page.php';  
    session_start();
    $contents = $_SESSION['contents'] ?? [];
?>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>게시판</title>

</head>
<body>
    <header>
        <h1>게시판 시스템</h1>
    </header>
    <!-- 권한 제한 -->
    <?php if ($role == 'manager'): ?>
        <a href='page_create.html'>작성</a> 
    <?php endif; ?> 
        
    <!-- 검색 -->
    <form action="page.php" method="GET">
        <input type="text" id="search" name="search" placeholder="search" value="<?php echo htmlspecialchars($_GET['search'] ?? ''); ?>">
        <button type="submit">조회</button>
    </form>
    <!-- 항목 출력 -->
    <?php foreach ($contents as $row): ?>
        <br><a href='page_view.php?id=<?php echo $row["id"]; ?>'>
            <?php echo htmlspecialchars($row["Num"]) .
            " : 제목: " . $row["title"] . 
            " - 날짜: " . $row["date"]; ?>
            </a><br>
    <?php endforeach; ?>

    <div class="navigation">
        <?php if ($page > 1): ?>
            <a href="page.php?page=<?php echo $page - 1; ?>&search=<?php echo urlencode($search); ?>">이전</a>
        <?php endif; ?>

        페이지 <?php echo $page; ?> / <?php echo $total_pages; ?>

        <?php if ($page < $total_pages): ?>
            <a href="page.php?page=<?php echo $page + 1; ?>&search=<?php echo urlencode($search); ?>">다음</a>
        <?php endif; ?>
    </div>
    <a href='logout.php'>로그아웃</a>  
</body>
</html>