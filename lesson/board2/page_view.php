<?php
    session_start();
    $id = intval($_GET['id']);
    require 'db_connect.php';
    
    $sql = "SELECT * FROM board2 WHERE id = $id" ;
    $result = $conn->query($sql);
    
    if(!$result){
        echo "error";
        exit;
    }else{
        $row = $result->fetch_assoc(); 
        $_SESSION['row'] = $row;
    }
    $role = $_SESSION['role'] ?? "";
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
            <a href="page_update.php">수정하기</a>
            <a href="delete.php?id=<?php echo $row['id']; ?>">삭제하기</a>
        <?php endif; ?>
    </section>

    <button onclick="history.back()">돌아가기</button>
</body>
</html>

