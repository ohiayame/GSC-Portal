<?php
require 'db_connect.php';

$id = intval($_GET['id'] ?? 0);

if ($id > 0) {
    $sql = "SELECT title, DATE_FORMAT(date, '%Y-%m-%d') AS date, writer, contents 
                FROM content WHERE id = ?";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $_SESSION['notice'] = $row;

        // 페이지 이동
        header('Location: page_view.php');
        exit;
    } else {
        echo '게시물을 찾을 수 없습니다. ID: ' . $id;
    }
} else {
    echo 'error';
}

$conn->close();
?>