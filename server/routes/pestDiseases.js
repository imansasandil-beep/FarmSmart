const router = require('express').Router();
const PestDisease = require('../models/PestDisease');

// GET ALL pest/disease records
router.get('/', async (req, res) => {
    try {
        const records = await PestDisease.find().sort({ name: 1 });
        res.status(200).json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// SEARCH pest/disease records by name or crop
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(400).json({ message: 'Please provide a search query (?q=...)' });
        }

        // Case-insensitive regex search on name and affectedCrops
        const regex = new RegExp(query, 'i');

        const results = await PestDisease.find({
            $or: [
                { name: { $regex: regex } },
                { affectedCrops: { $regex: regex } },
            ],
        }).sort({ name: 1 });

        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
