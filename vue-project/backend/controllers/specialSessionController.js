import { SpecialSession } from '../models/SpecialSession.js';

// ✅ 전체 휴·보강 조회
export const getAllSpecialSessions = async (req, res) => {
  try {
    const specialSessions = await SpecialSession.findAll();
    res.json(specialSessions);
    // console.log(specialSessions);
  } catch (err) {
    console.error("🚨 휴·보강 조회 오류:", err);
    res.status(500).json({ error: "휴·보강 데이터를 불러오는 데 실패했습니다." });
  }
};


// ✅ 휴·보강 추가
export const createSpecialSession = async (req, res) => {
  try {
    const result = await SpecialSession.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("🚨 휴·보강 추가 오류:", err);
    res.status(500).json({ error: "휴·보강 추가에 실패했습니다." });
  }
};

// ✅ 휴·보강 삭제
// export const deleteSpecialSession = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const affectedRows = await SpecialSession.delete(id);

//     if (!affectedRows) {
//       return res.status(404).json({ error: "해당 휴·보강 데이터가 존재하지 않습니다." });
//     }

//     res.json({ message: "휴·보강 정보가 삭제되었습니다." });
//   } catch (err) {
//     console.error("🚨 휴·보강 삭제 오류:", err);
//     res.status(500).json({ error: "휴·보강 삭제에 실패했습니다." });
//   }
// };
