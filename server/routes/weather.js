const router = require('express').Router();
const axios = require('axios');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// GET /api/weather?lat=6.9271&lon=79.8612
// Acts as a proxy — mobile app asks our server, our server fetches from OpenWeatherMap
router.get('/', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        // 1. Validate query parameters
        if (!lat || !lon) {
            return res.status(400).json({
                message: 'lat and lon query parameters are required',
            });
        }

        // 2. Fetch current weather from OpenWeatherMap
        const currentWeatherRes = await axios.get(`${BASE_URL}/weather`, {
            params: {
                lat,
                lon,
                appid: WEATHER_API_KEY,
                units: 'metric', // Celsius
            },
        });

        // 3. Fetch 5-day / 3-hour forecast from OpenWeatherMap
        const forecastRes = await axios.get(`${BASE_URL}/forecast`, {
            params: {
                lat,
                lon,
                appid: WEATHER_API_KEY,
                units: 'metric',
            },
        });

        // 4. Send combined response to the client
        res.status(200).json({
            current: currentWeatherRes.data,
            forecast: forecastRes.data,
        });
    } catch (err) {
        // If OpenWeatherMap returns an error, forward its status & message
        if (err.response) {
            return res.status(err.response.status).json({
                message: err.response.data.message || 'Weather API error',
            });
        }
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
