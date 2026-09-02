import { Router } from 'express';
import { healthRoutes } from './health.routes.js';
import { authRoutes } from './auth.routes.js';
import { publicTicketRoutes, ticketRoutes } from './ticket.routes.js';
import { userRoutes } from './user.routes.js';

const router = Router();

// 1. Health checks
router.use('/', healthRoutes);

// 2. Authentication
router.use('/auth', authRoutes);

// 3. Public customer routes
router.use('/public', publicTicketRoutes);

// 4. Authenticated internal ticket operations
router.use('/tickets', ticketRoutes);

// 5. Admin & agent operations
router.use('/', userRoutes);

export const apiRoutes = router;
export { healthRoutes, authRoutes, publicTicketRoutes, ticketRoutes, userRoutes };
