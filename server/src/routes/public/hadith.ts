import express from 'express';
import { getCollections, searchHadiths, getRandomHadith, getHadithById } from '../../controllers/public/hadithController';

const router = express.Router();

// Get all hadith collections
router.get('/collections', getCollections);

// Search hadiths
// Query parameters: q (required), collection (optional), limit (optional, default 20)
router.get('/search', searchHadiths);

// Get random hadith
// Query parameters: collection (optional)
router.get('/random', getRandomHadith);

// Get hadith by ID
router.get('/:id', getHadithById);

export default router;