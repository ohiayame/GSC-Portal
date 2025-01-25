<?php
$servername = "localhost";
$username = "root";
$password = "gsc1234!@#$";
$dbname = "me_database";

// MySQL 연결
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully<br>";

// 1. 삽입 INSERT INTO 
$sql = "INSERT INTO test (name, age) VALUES ('Ayame', 23)";
if ($conn->query($sql) === TRUE) {
    echo "New record created successfully<br>";
} else {
    echo "Error: " . $conn->error . "<br>";
}

// 2. 조회
$sql = "SELECT * FROM test WHERE name = 'bancho'";
$result = $conn->query($sql); //  쿼리를 실행 (반환: TRUE/FALSE)

if ($result->num_rows > 0) { // 조회된 행(row)의 개수를 반환
    while($row = $result->fetch_assoc()) { // 한 행씩 가져옴
        echo "ID: " . $row["id"] . " - Name: " . $row["name"] . " - Age: " . $row["age"] . "<br>";
    }
} else {
    echo "0 results";
}

// 3. 수정
$sql = "UPDATE test SET name = 'bancho' WHERE id = 2";

if ($conn->query($sql) === TRUE) {
    echo "Record updated successfully";
} else {
    echo "Error updating record: " . $conn->error;
}

// // 4. 삭제
$sql = "DELETE FROM test WHERE name = 'ririka'";

if ($conn->query($sql) === TRUE) {
    echo "Record deleted successfully";
} else {
    echo "Error deleting record: " . $conn->error;
}

$conn->close();
?>