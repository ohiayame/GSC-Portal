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

    $cmt_sql = "SELECT * FROM comments WHERE Bid = $id" ;
    $cmt_result = $conn->query($cmt_sql);


    $file_sql = "SELECT * FROM attachments WHERE noticeID = $id";
    $file_result = $conn->query($file_sql);


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


        <h3>첨부 파일</h3>
        <?php if ($file_result && $file_result->num_rows > 0): ?>
            <?php while ($file = $file_result->fetch_assoc()): ?>
                <!-- 이미지 미리보기: 이미지 파일일 경우만 표시 -->
                <?php if (preg_match('/\.(jpg|jpeg|png|gif)$/i', $file['fileName'])): ?>
                    <p>미리보기:</p>
                    <img src="<?php echo htmlspecialchars($file['filePath']); ?>" alt="첨부 이미지" style="max-width: 300px; max-height: 300px;">
                <?php endif; ?>

                <!-- 다운로드 링크 제공 -->
                <p>첨부 파일: 
                    <a href="<?php echo htmlspecialchars($file['filePath']); ?>" download>
                        <?php echo htmlspecialchars($file['fileName']); ?>
                    </a>
                </p>
            <?php endwhile; ?>
        <?php else: ?>
            <p>첨부 파일이 없습니다.</p>
        <?php endif; ?>



        <!-- 권한에 따라 표시  -->
        <?php if ($role == 'manager'): ?>
            <a href="page_update.php">수정하기</a>
            <a href="delete.php?id=<?php echo $row['id']; ?>">삭제하기</a>
        <?php endif; ?>
    </section>


    <h3>댓글</h3>
    <?php if(!$cmt_result){ ?>
        echo "<p>댓글 없음</p>";
    <?php }else{ 
        $i=0; ?>
        <?php while($cmt = $cmt_result->fetch_assoc()) {
            $i++;  ?>
            <p style="font-size: 12px;"><?php echo $i; ?>| 작성자: <?php echo htmlspecialchars($cmt['writer']); ?> | <?php echo htmlspecialchars($cmt['date']); ?> </p>
            <p><?php echo nl2br(htmlspecialchars($cmt['comment'])); ?></p>
        <?php } ?>
    <?php } ?>

    <form action="cmt_create.php?id=<?php echo $id; ?>" method="POST">
    <label for="comment">댓글:</label><br>
        <textarea id="comment" name="comment" rows="5" cols="50"></textarea>
        <br>
        <button type="submit">댓글하기</button>
    </form>
    <br>

    <button onclick="history.back()">돌아가기</button>
</body>
</html>

