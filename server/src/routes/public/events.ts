import { Router } from 'express';
import { getEvents, getEventById } from '../../controllers/public/eventsController';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);

export default router;