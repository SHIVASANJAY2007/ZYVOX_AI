import express from 'express';
import {
  saveMsg,
  getHistory,
  getRecent,
  sendMessageAndGetReply
} from '../controllers/chatController.js';

const router = express.Router();

router.post('/', saveMsg);
router.post('/send', sendMessageAndGetReply);
router.get('/history', getHistory);
router.get('/recent', getRecent);

export default router;
