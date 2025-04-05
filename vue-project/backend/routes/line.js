import express from 'express';
import {
  handleWebhook,
  issueLinkCode
} from '../controllers/lineController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/', handleWebhook);
router.get('/issue-code', authMiddleware, issueLinkCode);

export default router;



// router.post('/line-code', generateLineCode);

// const replyMessage = async (replyToken, text) => {
//   await axios.post('https://api.line.me/v2/bot/message/reply', {
//     replyToken,
//     messages: [{ type: 'text', text }]
//   }, {
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
//     }
//   });
// };

// router.post('/webhook', async (req, res) => {
//   const events = req.body.events;
//   console.log("req.body", req.body)

//   const firstEvent = events[0];
//   console.log("📥 사용자 ID:", firstEvent.source);        // ✅ 잘 나옴
//   console.log("📥 사용자 ID 직접:", firstEvent.source.userId);  // ✅ 이거도 가능

//   for (const event of events) {
//     if (event.type === 'message' && event.message.type === 'text') {
//       const text = event.message.text;
//       const replyToken = event.replyToken;

//       await replyMessage(replyToken, `📨 당신이 보낸 메시지: ${text}`);
//     }
//   }

//   res.sendStatus(200);
// });


// export default router;
