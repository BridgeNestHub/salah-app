import express from 'express';

const router = express.Router();

// Proxy Google Places API to hide API key
router.post('/places/search', async (req, res) => {
  try {
    const { lat, lng, radius = 8047 } = req.body;
    
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=mosque&key=${process.env.GOOGLE_PLACES_API_KEY}`);
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search places' });
  }
});

export default router;