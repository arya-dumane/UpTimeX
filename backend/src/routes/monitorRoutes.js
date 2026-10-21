import { Router } from 'express';
import {
  getMonitors,
  createMonitor,
  getDashboardSummary,
  deleteMonitor,
} from '../controllers/monitorController.js';

const router = Router();

router.route('/')
  .get(getMonitors)
  .post(createMonitor);

router.get('/summary', getDashboardSummary);
router.delete('/:id', deleteMonitor);

export default router;
