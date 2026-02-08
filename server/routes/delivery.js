const router = require('express').Router();
const Order = require('../models/Order');

// Sri Lankan city/district coordinates (approximate centers)
const SRI_LANKAN_LOCATIONS = {
    // Western Province
    'colombo': { lat: 6.9271, lng: 79.8612 },
    'gampaha': { lat: 7.0917, lng: 79.9995 },
    'kalutara': { lat: 6.5854, lng: 79.9607 },
    'negombo': { lat: 7.2083, lng: 79.8358 },
    'moratuwa': { lat: 6.7804, lng: 79.8816 },
    'dehiwala': { lat: 6.8565, lng: 79.8650 },
    'mount lavinia': { lat: 6.8390, lng: 79.8650 },

    // Central Province
    'kandy': { lat: 7.2906, lng: 80.6337 },
    'matale': { lat: 7.4675, lng: 80.6234 },
    'nuwara eliya': { lat: 6.9497, lng: 80.7891 },
    'peradeniya': { lat: 7.2590, lng: 80.5972 },

    // Southern Province
    'galle': { lat: 6.0535, lng: 80.2210 },
    'matara': { lat: 5.9485, lng: 80.5353 },
    'hambantota': { lat: 6.1241, lng: 81.1185 },
    'hikkaduwa': { lat: 6.1395, lng: 80.1034 },
    'unawatuna': { lat: 6.0174, lng: 80.2493 },

    // Northern Province
    'jaffna': { lat: 9.6615, lng: 80.0255 },
    'kilinochchi': { lat: 9.3803, lng: 80.3770 },
    'mannar': { lat: 8.9810, lng: 79.9044 },
    'vavuniya': { lat: 8.7542, lng: 80.4982 },

    // Eastern Province
    'trincomalee': { lat: 8.5874, lng: 81.2152 },
    'batticaloa': { lat: 7.7310, lng: 81.6747 },
    'ampara': { lat: 7.2976, lng: 81.6820 },

    // North Western Province
    'kurunegala': { lat: 7.4863, lng: 80.3647 },
    'puttalam': { lat: 8.0362, lng: 79.8283 },
    'chilaw': { lat: 7.5758, lng: 79.7953 },

    // North Central Province
    'anuradhapura': { lat: 8.3114, lng: 80.4037 },
    'polonnaruwa': { lat: 7.9403, lng: 81.0188 },

    // Uva Province
    'badulla': { lat: 6.9934, lng: 81.0550 },
    'monaragala': { lat: 6.8728, lng: 81.3507 },
    'ella': { lat: 6.8667, lng: 81.0466 },

    // Sabaragamuwa Province
    'ratnapura': { lat: 6.6828, lng: 80.3992 },
    'kegalle': { lat: 7.2513, lng: 80.3464 },
};

// Calculate distance between two points using Haversine formula (in km)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Find closest city match from address
const findCity = (address) => {
    if (!address) return null;

    const normalizedAddress = address.toLowerCase();

    // Direct match
    for (const city of Object.keys(SRI_LANKAN_LOCATIONS)) {
        if (normalizedAddress.includes(city)) {
            return city;
        }
    }

    return null;
};

// Calculate delivery fee based on distance
const calculateDeliveryFee = (pickupCity, dropoffCity) => {
    const BASE_FEE = 100; // Base fee in LKR
    const RATE_PER_KM = 15; // LKR per km
    const MIN_FEE = 150; // Minimum delivery fee
    const MAX_FEE = 2000; // Maximum delivery fee

    const pickup = SRI_LANKAN_LOCATIONS[pickupCity];
    const dropoff = SRI_LANKAN_LOCATIONS[dropoffCity];

    if (!pickup || !dropoff) {
        // Default fee if cities not found
        return parseInt(process.env.DELIVERY_FEE) || 250;
    }

    const distance = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);

    // Calculate fee: base + (distance * rate per km)
    let fee = Math.round(BASE_FEE + (distance * RATE_PER_KM));

    // Apply min/max limits
    fee = Math.max(MIN_FEE, Math.min(MAX_FEE, fee));

    return fee;
};

// Get delivery quote with distance-based pricing
router.post('/quote', async (req, res) => {
    try {
        const { pickupAddress, dropoffAddress } = req.body;

        if (!pickupAddress || !dropoffAddress) {
            return res.status(400).json({ message: 'Pickup and dropoff addresses are required' });
        }

        // Extract city names from addresses
        const pickupCity = findCity(pickupAddress.city || pickupAddress.street || '');
        const dropoffCity = findCity(dropoffAddress.city || dropoffAddress.street || '');

        // Calculate distance and fee
        let distance = 0;
        let deliveryFee = parseInt(process.env.DELIVERY_FEE) || 250;
        let estimatedTime = '45-60 minutes';

        if (pickupCity && dropoffCity) {
            const pickup = SRI_LANKAN_LOCATIONS[pickupCity];
            const dropoff = SRI_LANKAN_LOCATIONS[dropoffCity];

            distance = Math.round(calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng));
            deliveryFee = calculateDeliveryFee(pickupCity, dropoffCity);

            // Estimate delivery time based on distance
            if (distance < 20) {
                estimatedTime = '30-45 minutes';
            } else if (distance < 50) {
                estimatedTime = '1-2 hours';
            } else if (distance < 100) {
                estimatedTime = '2-4 hours';
            } else if (distance < 200) {
                estimatedTime = '4-6 hours';
            } else {
                estimatedTime = '1-2 days';
            }
        }

        res.status(200).json({
            quoteId: 'quote_' + Date.now(),
            fee: deliveryFee,
            currency: 'LKR',
            distance: distance,
            distanceUnit: 'km',
            estimatedDeliveryTime: estimatedTime,
            pickupCity: pickupCity || 'Unknown',
            dropoffCity: dropoffCity || 'Unknown',
        });

    } catch (error) {
        console.error('Delivery Quote Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create delivery record after payment
router.post('/create', async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId).populate('listingId buyerId sellerId');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.paymentStatus !== 'paid') {
            return res.status(400).json({ message: 'Payment not confirmed yet' });
        }

        // Update order status
        order.deliveryStatus = 'pending';
        order.status = 'processing';
        await order.save();

        res.status(200).json({
            deliveryId: 'delivery_' + Date.now(),
            status: 'pending',
            message: 'Delivery will be arranged by seller'
        });

    } catch (error) {
        console.error('Create Delivery Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get delivery status
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({
            status: order.deliveryStatus || 'pending',
            trackingUrl: null,
            courier: null,
        });

    } catch (error) {
        console.error('Delivery Status Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update delivery status (for seller to mark as shipped/delivered)
router.patch('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.deliveryStatus = status;
        if (status === 'delivered') {
            order.status = 'delivered';
        }
        await order.save();

        res.status(200).json({
            status: order.deliveryStatus,
            message: `Delivery status updated to ${status}`
        });

    } catch (error) {
        console.error('Update Delivery Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
