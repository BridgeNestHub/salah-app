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

// Find nearby places
router.get('/places/nearby', async (req, res) => {
  try {
    const { lat, lng, type = 'mosque', radius = 8047 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: type,
        location: `${lat},${lng}`,
        radius,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Nearby places API error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby places' });
  }
});

export default router;