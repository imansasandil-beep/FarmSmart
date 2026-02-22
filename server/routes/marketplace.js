const router = require('express').Router();
const Listing = require('../models/Listing');

/**
 * Marketplace Routes
 * These handle all the CRUD operations for listings.
 * The marketplace is PUBLIC - anyone can browse, but only logged-in users can create/edit.
 */

// GET /api/marketplace - Fetch all active listings
// This is the main feed that buyers see when they open the marketplace
router.get('/', async (req, res) => {
    try {
        // Only show active listings, newest first
        // We populate seller info so we can show their name and verification status
        const listings = await Listing.find({ isActive: { $ne: false } })
            .populate('sellerId', 'fullName isVerified averageRating totalReviews')
            .sort({ createdAt: -1 });
        res.status(200).json(listings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/marketplace/:id - Get a single listing by ID
// Used when user taps on a listing to see full details
router.get('/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('sellerId', 'fullName isVerified averageRating totalReviews');
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        res.status(200).json(listing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/marketplace/add - Create a new listing
// Called when a farmer submits the "Add Listing" form
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

        // Basic validation - make sure we have the essentials
        if (!title || !price || !sellerId) {
            return res.status(400).json({ message: 'Please provide title, price, and be logged in' });
        }

        // Create the listing with all the details
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
            imageUrl: imageUrl || undefined, // Use default if not provided
            isActive: true,
        });

        const savedListing = await newListing.save();

        res.status(201).json({ message: 'Listing created successfully!', listing: savedListing });

    } catch (err) {
        console.error('Create listing error:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/marketplace/:id - Update an existing listing
// Sellers can edit their listings (change price, update stock, etc.)
router.put('/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Update any fields that were sent in the request
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

// DELETE /api/marketplace/:id - Remove a listing (soft delete)
// We don't actually delete - just mark as inactive
// This way it can still appear in order history
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

// GET /api/marketplace/seller/:sellerId - Get all listings by a specific seller
// Used on seller's profile or "My Listings" page
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
