const router = require('express').Router();
const Listing = require('../models/Listing');

// GET /api/marketplace - Fetch all active listings (sorted by newest first)
router.get('/', async (req, res) => {
    try {
        const listings = await Listing.find({ isActive: { $ne: false } })
            .sort({ createdAt: -1 });
        res.status(200).json(listings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/marketplace/:id - Get single listing
router.get('/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        res.status(200).json(listing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/marketplace/add - Create a new listing
router.post('/add', async (req, res) => {
    try {
        const {
            title,
            price,
            quantity,
            availableQuantity,
            unit,
            description,
            sellerId,
            pickupAddress,
            location,
            imageUrl
        } = req.body;

        // Validate required fields
        if (!title || !price || !sellerId) {
            return res.status(400).json({ message: 'Please provide title, price, and be logged in' });
        }

        // Create the new listing
        const newListing = new Listing({
            title: title.trim(),
            price: Number(price),
            quantity: quantity || `${availableQuantity} ${unit || 'kg'}`,
            availableQuantity: Number(availableQuantity) || 1,
            unit: unit || 'kg',
            description: description ? description.trim() : '',
            sellerId,
            pickupAddress: pickupAddress || {},
            location: location ? location.trim() : '',
            imageUrl: imageUrl || undefined,
            isActive: true,
        });

        // Save to MongoDB
        const savedListing = await newListing.save();

        res.status(201).json({ message: 'Listing created successfully!', listing: savedListing });

    } catch (err) {
        console.error('Create listing error:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/marketplace/:id - Update a listing
router.put('/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Update fields
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                listing[key] = req.body[key];
            }
        });

        listing.updatedAt = Date.now();
        const updatedListing = await listing.save();

        res.status(200).json({ message: 'Listing updated', listing: updatedListing });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/marketplace/:id - Deactivate a listing
router.delete('/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        listing.isActive = false;
        await listing.save();

        res.status(200).json({ message: 'Listing removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/marketplace/seller/:sellerId - Get seller's listings
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const listings = await Listing.find({
            sellerId: req.params.sellerId,
            isActive: { $ne: false }
        }).sort({ createdAt: -1 });
        res.status(200).json(listings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
