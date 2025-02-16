import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 5000;

// 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 데이터 파싱

// 데이터 저장 파일
const DATA_FILE = "users.json";

// 서버 실행 시 JSON 파일이 없으면 초기화
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [] }, null, 2));
}

// 사용자 목록 가져오기 (GET 요청)
app.get("/users", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  res.json(data.users);
});

// 사용자 추가 (POST 요청)
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

  const newUser = { id: Date.now(), name, email };
  data.users.push(newUser);

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); // 파일 저장
  res.status(201).json(newUser);
});

// 사용자 삭제 (DELETE 요청)
app.delete("/users/:id", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  const userId = parseInt(req.params.id);
  data.users = data.users.filter(user => user.id !== userId);

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ message: "사용자가 삭제되었습니다." });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
