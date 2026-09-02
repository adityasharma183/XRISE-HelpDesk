import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';

const router = Router();

router.get('/health', HealthController.getHealth);

export const healthRoutes = router;
