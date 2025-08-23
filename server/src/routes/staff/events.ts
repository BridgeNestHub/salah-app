import { Router } from 'express';
import { createEvent, updateEvent, getMyEvents } from '../../controllers/staff/eventsController';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Apply authentication middleware
router.use(authenticate);
router.use(requireRole(['staff', 'admin']));

router.get('/my-events', getMyEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);

export default router;