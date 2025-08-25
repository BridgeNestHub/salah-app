import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get places autocomplete suggestions
router.get('/places/autocomplete', async (req, res) => {
  try {
    const { input, types = 'geocode' } = req.query;
    
    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params: {
        input,
        types,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Places autocomplete API error:', error);
    res.status(500).json({ error: 'Failed to fetch place suggestions' });
  }
});

// Get place details
router.get('/places/details', async (req, res) => {
  try {
    const { place_id } = req.query;
    
    if (!place_id) {
      return res.status(400).json({ error: 'Place ID is required' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Place details API error:', error);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

// Find nearby mosques
router.get('/mosques/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 8047 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius,
        keyword: 'mosque',
        type: 'place_of_worship',
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Nearby mosques API error:', error);
    res.status(500).json({ error: 'Failed to find nearby mosques' });
  }
});

// Geocode coordinates to address
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