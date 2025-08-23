import { Router } from 'express';
import { getContactSubmissions, updateSubmissionStatus } from '../../controllers/staff/contactController';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Apply authentication middleware
router.use(authenticate);
router.use(requireRole(['staff', 'admin']));

router.get('/submissions', getContactSubmissions);
router.put('/submissions/:id', updateSubmissionStatus);

export default router;