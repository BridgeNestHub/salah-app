import { Router } from 'express';
import { submitContact } from '../../controllers/public/contactController';

const router = Router();

router.post('/', submitContact);

export default router;