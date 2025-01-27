<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update Page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <?php
        // 데이터베이스 연결 정보
        $host = 'localhost';
        $user = 'root';
        $pass = 'gsc1234!@#$';
        $dbname = 'me_database';

        $conn = new mysqli($host, $user, $pass, $dbname);

        if ($conn->connect_error) {
            die('DB 연결 실패: ' . $conn->connect_error);
        }

        // GET 요청으로 전달된 id 가져오기
        $id = intval($_GET['id']);

        if ($id) {
            // 해당 게시물의 데이터를 조회
            $sql = "SELECT * FROM Board WHERE id = $id";
            $result = $conn->query($sql);

            if ($result && $result->num_rows > 0) {
                $row = $result->fetch_assoc();
            } else {
                die("게시물을 찾을 수 없습니다.");
            }
        } else {
            die("잘못된 요청입니다.");
        }

        // 데이터베이스 연결 종료
        $conn->close();
    ?>

    <h1>게시물 수정</h1>
    <form action="process_update.php" method="POST">
        <!-- 숨겨진 입력 필드로 id 전달 -->
        <input type="hidden" name="id" value="<?php echo $id; ?>">

        <label for="title">제목:</label>
        <input type="text" id="title" name="title" value="<?php echo htmlspecialchars($row['title']); ?>" required>
        <br><br>

        <label for="content">내용:</label><br>
        <textarea id="content" name="content" rows="10" cols="50" required><?php echo htmlspecialchars($row['content']); ?></textarea>
        <br><br>

        <button type="submit">수정 완료</button>
    </form>
</body>
</html>
