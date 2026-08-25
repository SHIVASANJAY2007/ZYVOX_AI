import express from 'express';
import { searchPexelsMedia } from '../controllers/pexelsController.js';

const router = express.Router();

router.get('/search', searchPexelsMedia);

export default router;
