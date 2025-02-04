<?php
require 'db_connect.php';
session_start();
$Bid = $_GET['id'];
$comment = $_POST['comment'];
$writer = $_SESSION['name'] ?? "";
// date는 자동

$sql = "INSERT INTO comments (Bid, comment, writer) VALUES ($Bid, '$comment', '$writer')";
if ($conn->query($sql) === TRUE) {
    header('Location: page_view.php?id='.$Bid);
} else {
    echo "Error: " . $conn->error . "<br>";
}
?>