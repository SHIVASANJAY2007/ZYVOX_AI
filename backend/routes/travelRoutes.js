import express from 'express';
import {
  createPlan,
  getPlansByUser,
  getPlanById,
  updatePlan,
  deletePlan
} from '../controllers/travelController.js';

const router = express.Router();

router.post('/', createPlan);
router.get('/user/:personId', getPlansByUser);
router.get('/:travelId', getPlanById);
router.put('/:travelId', updatePlan);
router.delete('/:travelId', deletePlan);

export default router;
