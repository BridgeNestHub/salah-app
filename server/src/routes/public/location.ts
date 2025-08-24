import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get user's approximate location by IP
router.get('/ip-location', async (req, res) => {
  try {
    const response = await axios.get('https://ipapi.co/json/');
    res.json(response.data);
  } catch (error) {
    console.error('IP location API error:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// Geocode coordinates to address using Google Maps
router.get('/geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${lat},${lng}`,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Geocoding API error:', error);
    res.status(500).json({ error: 'Failed to geocode location' });
  }
});

export default router;