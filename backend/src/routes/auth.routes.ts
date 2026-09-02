import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/login', authLimiter, validate({ body: loginSchema }), asyncHandler(AuthController.login));
router.post('/logout', asyncHandler(AuthController.logout));
router.get('/me', authenticate, asyncHandler(AuthController.getMe));

export const authRoutes = router;
