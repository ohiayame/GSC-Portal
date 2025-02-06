<?php
    session_start();


    $row = $_SESSION['row'];
    $bfile = $_SESSION['file'] ?? null;
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>게시물 수정</title>
</head>
<body>
    <h1>게시물 수정</h1>
    <form action="update.php" method="POST" enctype="multipart/form-data">

        <input type="hidden" name="id" value="<?php echo htmlspecialchars($row['id']); ?>">

        <label for="title">제목:</label>
        <input type="text" id="title" name="title" value="<?php echo htmlspecialchars($row['title']); ?>" required>
        <br><br>

        <label for="contents">내용:</label><br>
        <textarea id="content" name="contents" rows="10" cols="50" required><?php echo htmlspecialchars($row['contents']); ?></textarea>
        <br><br>

        <h3>첨부 파일</h3>
        <label for="file">첨부파일:</label>
        <input type="file" name="file" id="file">

        <?php if ($bfile && preg_match('/\.(jpg|jpeg|png|gif)$/i', $bfile['fileName'])){ ?>
            <p>기존 파일:</p>
            <img src="<?php echo htmlspecialchars($bfile['filePath']); ?>" alt="첨부 이미지" style="max-width: 300px; max-height: 300px;">
        <?php } else{ ?>
            <p>첨부 파일이 없습니다.</p>
        <?php }; ?>


        <button type="submit">수정 완료</button>
    </form>
    <button onclick="history.back()">돌아가기</button>
</body>
</html>
