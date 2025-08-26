import express from 'express';
import axios from 'axios';

const router = express.Router();

// Debug endpoint to check API key configuration
router.get('/debug', async (req, res) => {
  try {
    const hasApiKey = !!process.env.GOOGLE_MAPS_BACKEND_KEY;
    const keyPrefix = process.env.GOOGLE_MAPS_BACKEND_KEY?.substring(0, 20) + '...';
    
    res.json({ 
      hasApiKey,
      keyPrefix: hasApiKey ? keyPrefix : 'No API key found',
      nodeEnv: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Debug endpoint failed' });
  }
});

// Get places autocomplete suggestions
router.get('/places/autocomplete', async (req, res) => {
  try {
    const { input, types = 'geocode' } = req.query;
    
    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }

    if (!process.env.GOOGLE_MAPS_BACKEND_KEY) {
      console.error('GOOGLE_MAPS_BACKEND_KEY is not set');
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    console.log('Making autocomplete request with input:', input);

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params: {
        input,
        types,
        key: process.env.GOOGLE_MAPS_BACKEND_KEY
      }
    });

    console.log('Autocomplete response status:', response.data.status);
    res.json(response.data);
  } catch (error) {
    console.error('Places autocomplete API error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
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

    if (!process.env.GOOGLE_MAPS_BACKEND_KEY) {
      console.error('GOOGLE_MAPS_BACKEND_KEY is not set');
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    console.log('Making place details request for place_id:', place_id);

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id,
        key: process.env.GOOGLE_MAPS_BACKEND_KEY
      }
    });

    console.log('Place details response status:', response.data.status);
    res.json(response.data);
  } catch (error) {
    console.error('Place details API error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

// Find nearby mosques
router.get('/mosques/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 8047 } = req.query;
    
    console.log('Nearby mosques request:', { lat, lng, radius });
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    if (!process.env.GOOGLE_MAPS_BACKEND_KEY) {
      console.error('GOOGLE_MAPS_BACKEND_KEY is not set');
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    console.log('Making nearby search request...');

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location: `${lat},${lng}`,
        radius,
        keyword: 'mosque',
        type: 'place_of_worship',
        key: process.env.GOOGLE_MAPS_BACKEND_KEY
      }
    });

    console.log('Nearby search response status:', response.data.status);
    console.log('Number of results:', response.data.results?.length || 0);
    
    res.json(response.data);
  } catch (error) {
    console.error('Nearby mosques API error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Request URL:', error.config?.url);
    }
    res.status(500).json({ error: 'Failed to find nearby mosques' });
  }
});

// Geocode coordinates to address
router.get('/geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    console.log('Geocoding request:', { lat, lng });
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    if (!process.env.GOOGLE_MAPS_BACKEND_KEY) {
      console.error('GOOGLE_MAPS_BACKEND_KEY is not set');
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    console.log('Making geocoding request...');

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${lat},${lng}`,
        key: process.env.GOOGLE_MAPS_BACKEND_KEY
      }
    });

    console.log('Geocoding response status:', response.data.status);
    res.json(response.data);
  } catch (error) {
    console.error('Geocoding API error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Request URL:', error.config?.url);
    }
    res.status(500).json({ error: 'Failed to geocode location' });
  }
});

export default router;