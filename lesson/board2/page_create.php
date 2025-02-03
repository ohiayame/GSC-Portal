<?php
require 'db_connect.php';
// require 'session_manager.php';

$title = $_POST['title'];
$contents = $_POST['contents'];
$writer = isset($name) ? $name : "";
// date는 자동

$sql = "INSERT INTO board2 (title, contents, writer) VALUES ('$title', '$contents', '$writer')";
if ($conn->query($sql) === TRUE) {
    header('Location: homepage.php');
} else {
    echo "Error: " . $conn->error . "<br>";
}
?>