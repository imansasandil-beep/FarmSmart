const router = require('express').Router();
const axios = require('axios');

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// GET /api/weather?lat=6.9271&lon=79.8612
// Acts as a proxy — mobile app asks our server, our server fetches from OpenWeatherMap
router.get('/', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

        // 1. Validate query parameters
        if (!lat || !lon) {
            return res.status(400).json({
                message: 'lat and lon query parameters are required',
            });
        }

        // TODO: Add weather API calls here

        res.status(200).json({ message: 'Weather route is working', lat, lon });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
