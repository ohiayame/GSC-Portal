<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>타누키</h1>
    <a href='create.html'>작성</a>   
        <form action="page.php" method="GET">
            <input type="text" id="search" name="search" placeholder= "search">
            <button type="submit">조회</button>
        </form>
        <?php
            $host = 'localhost'; // DB 호스트
            $user = 'root'; // DB 사용자명
            $pass = 'gsc1234!@#$'; // DB 비밀번호
            $dbname = 'me_database'; // DB 이름

            $conn = new mysqli($host, $user, $pass, $dbname);

            if ($conn->connect_error) {
                die('DB 연결 실패: ' . $conn->connect_error);
            }

            $search = $_GET['search'] ?? "";

            if ($search == ""){
                $sql = "SELECT * FROM Board ORDER BY created_at DESC";
            }else{
                $sql = "SELECT * FROM Board 
                WHERE content LIKE '%$search%' OR title LIKE '%$search%' 
                ORDER BY created_at DESC";
            }
            
            $result = $conn->query($sql); //  쿼리를 실행 (반환: TRUE/FALSE)
            $num = 0;
            if ($result->num_rows > 0) { // 조회된 행(row)의 개수를 반환
                while($row = $result->fetch_assoc()) { // 한 행씩 가져옴
                    $num++;
                    echo "<br><a href='view.php?id=".$row["id"] ."'>". $num .
                    " : 제목: " . $row["title"] . 
                    " - 날짜: " . $row["created_at"] . "</a><br>";
                }
            } else {
                echo "게시물 없음";
            }
        ?>
        
    <a href='logout.php'>로그아웃</a>    
</body>
</html>