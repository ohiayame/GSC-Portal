<?php
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
    <title>게시물 수정</title>
</head>
<body>
    <h1>게시물 수정</h1>
    <form action="update.php" method="POST">

        <input type="hidden" name="id" value="<?php echo $id; ?>">

        <label for="title">제목:</label>
        <input type="text" id="title" name="title" value="<?php echo htmlspecialchars($row['title']); ?>" required>
        <br><br>

        <label for="contents">내용:</label><br>
        <textarea id="content" name="contents" rows="10" cols="50" required><?php echo htmlspecialchars($row['contents']); ?></textarea>
        <br><br>

        <button type="submit">수정 완료</button>
    </form>
    <button onclick="history.back()">돌아가기</button>
</body>
</html>
