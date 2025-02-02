<?php
require 'db_connect.php';

$stdNum = $_POST['stdNum'];
$name = $_POST['name'];
$password = $_POST['password'];
$role = $_POST['role'];

$sql = "INSERT INTO users (stdNum, name, password, role) VALUES ($stdNum, '$name', '$password', '$role')";
if ($conn->query($sql) === TRUE) {
    header('Location: login.html');
    exit;
} else {
    header('Location: ' . $_SERVER['HTTP_REFERER']);
    exit;
}

?>