import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Only ADMIN can fetch full agent list for reassignments
router.get('/agents', authenticate, authorize('ADMIN'), asyncHandler(UserController.getAgents));

export const userRoutes = router;
