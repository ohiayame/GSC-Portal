<?php
require 'db_connect.php';
session_start();
$Bid = $_GET['id'];
$parent_comment_id = isset($_POST['parent_comment_id']) ? intval($_POST['parent_comment_id']) : NULL;
$comment = $_POST['comment'];
$writer = $_SESSION['name'] ?? "";
// date는 자동

$sql = "INSERT INTO comments (Bid, cid, comment, writer) VALUES ($Bid, $parent_comment_id, '$comment', '$writer')";
if ($conn->query($sql) === TRUE) {
    header('Location: page_view.php?id='.$Bid);
} else {
    echo "Error: " . $conn->error . "<br>";
}
?>