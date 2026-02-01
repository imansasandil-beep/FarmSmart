const router = require('express').Router();
const Listing = require('../models/Listing');

// GET /api/marketplace - Fetch all listings (sorted by newest first)
router.get('/', async (req, res) => {
    try {
        const listings = await Listing.find().sort({ createdAt: -1 });
        res.status(200).json(listings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/marketplace/add - Create a new listing
router.post('/add', async (req, res) => {
    try {
        const { title, price, quantity, description, sellerName, sellerPhone, location, imageUrl } = req.body;

        // Validate required fields
        if (!title || !price || !quantity || !sellerPhone) {
            return res.status(400).json({ message: 'Please provide title, price, quantity, and phone number' });
        }

        // Create the new listing
        const newListing = new Listing({
            title: title.trim(),
            price: Number(price),
            quantity: quantity.trim(),
            description: description ? description.trim() : '',
            sellerName: sellerName ? sellerName.trim() : '',
            sellerPhone: sellerPhone.trim(),
            location: location ? location.trim() : '',
            imageUrl: imageUrl || undefined, // Use default if not provided
        });

        // Save to MongoDB
        const savedListing = await newListing.save();

        res.status(201).json({ message: 'Listing created successfully!', listing: savedListing });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
