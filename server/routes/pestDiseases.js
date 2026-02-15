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

module.exports = router;