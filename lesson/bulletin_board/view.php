<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <?php
        $host = 'localhost'; // DB 호스트
        $user = 'root'; // DB 사용자명
        $pass = 'gsc1234!@#$'; // DB 비밀번호
        $dbname = 'me_database'; // DB 이름

        $conn = new mysqli($host, $user, $pass, $dbname);

        if ($conn->connect_error) {
            die('DB 연결 실패: ' . $conn->connect_error);
        }

        $id = intval($_GET['id']);
        if ($id) {
            $sql = "SELECT * FROM Board WHERE id = $id" ;
            $result = $conn->query($sql);
            if (!$result) {
                die("쿼리 실행 실패: " . $conn->error);
            }

            $row = $result->fetch_assoc();
            echo "<br>";
            echo  "<h1>제목: " . $row["title"] ."</h1>"; 
            echo  "<br> - 날짜: " . $row["created_at"] . "- 작성자: " . $row["writer"];
            echo  "<br> - 내용: " . $row["content"];

            echo "<a href='update.php?id=$id>'>수정하기</a>";
            echo "<button onclick=\"if(confirm('정말 삭제하시겠습니까?')) location.href='delete.php?id=$id';\">삭제하기</button>";
        }else{
            echo "error";
        }
    ?>

    <button onclick="history.back()">돌아가기</button>
    
</body>
</html>