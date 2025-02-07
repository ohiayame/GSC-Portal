<?php
session_start();
$id = intval($_GET['id']);
require 'db_connect.php';

// 게시글 데이터 조회
$sql = "SELECT * FROM board2 WHERE id = $id";
$result = $conn->query($sql);

if (!$result) {
    echo "error";
    exit;
} else {
    $row = $result->fetch_assoc();
    $_SESSION['row'] = $row;
}
$role = $_SESSION['role'] ?? "";

// 댓글 데이터 조회
$cmt_sql = "SELECT * FROM comments WHERE Bid = $id AND cid IS NULL ORDER BY date ASC";
$cmt_result = $conn->query($cmt_sql);

// 첨부 파일 조회
$file_sql = "SELECT * FROM attachments WHERE noticeID = $id";
$file_result = $conn->query($file_sql);
$file = $file_result->fetch_assoc();
$_SESSION['file'] = $file;
?>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>게시판 상세내용</title>
    <style>
        .comment { margin-bottom: 20px; }
        .reply { margin-left: 20px; font-size: 12px; color: gray; }
    </style>
</head>
<body>
    <section>
        <h1>제목: <?php echo htmlspecialchars($row['title']); ?></h1>
        <p>- 날짜: <?php echo htmlspecialchars($row['date']); ?> | 작성자: <?php echo htmlspecialchars($row['writer']); ?></p>
        <p>- 내용: <?php echo nl2br(htmlspecialchars($row['contents'])); ?></p>

        <h3>첨부 파일</h3>
        <?php if ($file): ?>
            <?php if (preg_match('/\.(jpg|jpeg|png|gif)$/i', $file['fileName'])): ?>
                <p>미리보기:</p>
                <img src="<?php echo htmlspecialchars($file['filePath']); ?>" alt="첨부 이미지" style="max-width: 300px; max-height: 300px;">
            <?php endif; ?>
            <p>첨부 파일: 
                <a href="<?php echo htmlspecialchars($file['filePath']); ?>" download>
                    <?php echo htmlspecialchars($file['fileName']); ?>
                </a>
            </p>
        <?php else: ?>
            <p>첨부 파일이 없습니다.</p>
        <?php endif; ?>

        <!-- 권한에 따라 수정 및 삭제 버튼 표시 -->
        <?php if ($role == 'manager'): ?>
            <a href="page_update.php">수정하기</a>
            <a href="delete.php?id=<?php echo $row['id']; ?>">삭제하기</a>
        <?php endif; ?>
    </section>

    <h3>댓글</h3>
    <?php if (!$cmt_result || $cmt_result->num_rows === 0): ?>
        <p>댓글 없음</p>
    <?php else: 
        $i = 0; ?>
        <?php while ($cmt = $cmt_result->fetch_assoc()) { 
            $i++; ?>
            <!-- 댓글 표시 -->
            <div class="comment">
                <p style="font-size: 12px;"><?php echo $i; ?>| 작성자: <?php echo htmlspecialchars($cmt['writer']); ?> | <?php echo htmlspecialchars($cmt['date']); ?></p>
                <p><?php echo nl2br(htmlspecialchars($cmt['comment'])); ?></p>

                <!-- 대댓글 출력 -->
                <?php
                $comment_id = $cmt['id'];
                $reply_sql = "SELECT * FROM comments WHERE cid = $comment_id ORDER BY date ASC";
                $reply_result = $conn->query($reply_sql);

                if ($reply_result && $reply_result->num_rows > 0) {
                    while ($reply = $reply_result->fetch_assoc()) {
                        echo "<div class='reply'>";
                        echo "<p>↳ " . htmlspecialchars($reply['writer']) . " | " . htmlspecialchars($reply['date']) . "</p>";
                        echo "<p>" . nl2br(htmlspecialchars($reply['comment'])) . "</p>";
                        echo "</div>";
                    }
                }
                ?>
                <!-- 대댓글 작성 버튼 -->
                <button type="button" onclick="selectReply(<?php echo $comment_id; ?>, <?php echo $i; ?>)">대댓글 작성</button>
            </div>
        <?php } ?>
    <?php endif; ?>

    <!-- 댓글 및 대댓글 작성 폼 -->
    <h4>댓글 작성</h4>
    <form action="cmt_create.php?id=<?php echo $id; ?>" method="POST">
        <input type="hidden" id="parent_comment_id" name="parent_comment_id" value="">
        <textarea id="comment" name="comment" rows="5" cols="50" placeholder="<?php echo htmlspecialchars($placeholder) ; ?>"></textarea><br>
        <button type="submit">작성하기</button>
    </form>

    <script>
        // 대댓글 작성 버튼 클릭 시 상위 댓글 ID 설정
        function selectReply(commentId, index) {
        document.getElementById('parent_comment_id').value = commentId;
        document.getElementById('comment').setAttribute('placeholder', '-> ' + index);
        document.getElementById('comment').focus();
    }
    </script>

    <br>
    <button onclick="history.back()">돌아가기</button>
</body>
</html>
