import { Router } from 'express';
import { analytics } from '../controllers/analyticsController.js';
// Analytics API: controller handles query validation and response.

const router = Router();

router.get('/', analytics);

export default router;