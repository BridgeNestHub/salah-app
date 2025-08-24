import express from 'express';
import axios from 'axios';

const router = express.Router();

// Get prayer times by coordinates
router.get('/times', async (req, res) => {
  try {
    const { latitude, longitude, method = '2' } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const response = await axios.get(`${process.env.ALADHAN_API_URL}/timings`, {
      params: { latitude, longitude, method }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Prayer times API error:', error);
    res.status(500).json({ error: 'Failed to fetch prayer times' });
  }
});

// Get prayer times by city
router.get('/times/city', async (req, res) => {
  try {
    const { city, country = '', method = '2' } = req.query;
    
    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }

    const response = await axios.get(`${process.env.ALADHAN_API_URL}/timingsByCity`, {
      params: { city, country, method }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Prayer times by city API error:', error);
    res.status(500).json({ error: 'Failed to fetch prayer times' });
  }
});

// Convert Gregorian to Hijri date
router.get('/hijri-date', async (req, res) => {
  try {
    const { date } = req.query;
    const today = date || `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;

    const response = await axios.get(`${process.env.ALADHAN_API_URL}/gToH/${today}`);
    res.json(response.data);
  } catch (error) {
    console.error('Hijri date API error:', error);
    res.status(500).json({ error: 'Failed to fetch Hijri date' });
  }
});

export default router;