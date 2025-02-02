<?php
require 'session_manager.php';
session_start();
// page_get에서 해당id의 $_SESSION['notice']을 선언
$row = $_SESSION['notice'] ;
$id = intval($_GET['id']);
?>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>게시판 상세내용</title>

</head>
<body>
    <section>
        <h1>제목: <?php echo htmlspecialchars($row['title']); ?></h1>
        <p>- 날짜: <?php echo htmlspecialchars($row['date']); ?> | 작성자: <?php echo htmlspecialchars($row['writer']); ?></p>
        <p>- 내용: <?php echo nl2br(htmlspecialchars($row['contents'])); ?></p>

        <!-- 권한에 따라 표시  -->
        <?php if ($role == 'manager'): ?>
            <a href="page_update.php?id=<?php echo $id; ?>">수정하기</a>
            <button onclick="if(confirm('정말 삭제하시겠습니까?')) location.href='delete.php?id=<?php echo $id; ?>';">삭제하기</button>
        <?php endif; ?>
    </section>

    <button onclick="history.back()">돌아가기</button>
</body>
</html>

