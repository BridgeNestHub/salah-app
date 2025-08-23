import { Router } from 'express';
import { createEvent, updateEvent, deleteEvent, getAllEvents } from '../../controllers/admin/eventsController';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Apply authentication middleware
router.use(authenticate);
router.use(requireRole(['admin']));

router.get('/', getAllEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;