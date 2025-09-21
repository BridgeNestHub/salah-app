import { Router } from 'express';
import { 
  getContactSubmissions, 
  getSubmissionById,
  updateSubmissionStatus,
  deleteSubmission 
} from '../../controllers/admin/contactController';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Apply authentication middleware
router.use(authenticate);
router.use(requireRole(['admin']));

router.get('/submissions', getContactSubmissions);
router.get('/submissions/:id', getSubmissionById);
router.put('/submissions/:id', updateSubmissionStatus);
router.delete('/submissions/:id', deleteSubmission);

export default router;