const router = require('express').Router();

/**
 * Delivery Routes
 * Handles delivery fee calculation based on distance between
 * buyer and seller locations in Sri Lanka.
 * 
 * Also integrates with Uber Direct API for actual delivery dispatch.
 * For now we calculate fees ourselves based on distance tiers.
 */

// Sri Lankan cities and their approximate coordinates
// Used for distance-based delivery fee calculation
const SRI_LANKA_CITIES = {
    'colombo': { lat: 6.9271, lng: 79.8612 },
    'kandy': { lat: 7.2906, lng: 80.6337 },
    'galle': { lat: 6.0535, lng: 80.2210 },
    'jaffna': { lat: 9.6615, lng: 80.0255 },
    'negombo': { lat: 7.2008, lng: 79.8737 },
    'anuradhapura': { lat: 8.3114, lng: 80.4037 },
    'trincomalee': { lat: 8.5874, lng: 81.2152 },
    'batticaloa': { lat: 7.7310, lng: 81.6924 },
    'matara': { lat: 5.9549, lng: 80.5550 },
    'kurunegala': { lat: 7.4863, lng: 80.3647 },
    'ratnapura': { lat: 6.6828, lng: 80.3992 },
    'badulla': { lat: 6.9934, lng: 81.0550 },
    'nuwara eliya': { lat: 6.9497, lng: 80.7891 },
    'matale': { lat: 7.4675, lng: 80.6234 },
    'kegalle': { lat: 7.2513, lng: 80.3464 },
    'kalutara': { lat: 6.5854, lng: 79.9607 },
    'hambantota': { lat: 6.1241, lng: 81.1185 },
    'ampara': { lat: 7.2976, lng: 81.6720 },
    'polonnaruwa': { lat: 7.9403, lng: 81.0188 },
    'dambulla': { lat: 7.8742, lng: 80.6511 },
};

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Calculate delivery fee based on distance
 * Pricing tiers (in LKR):
 * - Under 10km: Rs. 200
 * - 10-30km: Rs. 400
 * - 30-80km: Rs. 700
 * - 80-150km: Rs. 1200
 * - Over 150km: Rs. 1800
 */
function calculateDeliveryFee(distanceKm) {
    if (distanceKm <= 10) return 200;
    if (distanceKm <= 30) return 400;
    if (distanceKm <= 80) return 700;
    if (distanceKm <= 150) return 1200;
    return 1800;
}

/**
 * Try to find city coordinates from our lookup table
 * Does a fuzzy match so "Colombo 07" still matches "colombo"
 */
function findCityCoordinates(locationString) {
    if (!locationString) return null;
    const normalized = locationString.toLowerCase().trim();

    // Try exact match first
    if (SRI_LANKA_CITIES[normalized]) {
        return SRI_LANKA_CITIES[normalized];
    }

    // Try to find a city name within the string
    for (const [city, coords] of Object.entries(SRI_LANKA_CITIES)) {
        if (normalized.includes(city) || city.includes(normalized)) {
            return coords;
        }
    }

    return null;
}

// POST /api/delivery/quote - Get a delivery fee quote
router.post('/quote', async (req, res) => {
    try {
        const { pickupLocation, deliveryLocation } = req.body;

        if (!pickupLocation || !deliveryLocation) {
            return res.status(400).json({ message: 'Both pickup and delivery locations are required' });
        }

        // Try to resolve coordinates for both locations
        const pickupCoords = findCityCoordinates(pickupLocation);
        const deliveryCoords = findCityCoordinates(deliveryLocation);

        if (!pickupCoords || !deliveryCoords) {
            // If we can't find one of the cities, use a default mid-range fee
            return res.status(200).json({
                deliveryFee: 500,
                distance: null,
                estimatedTime: '2-4 hours',
                message: 'Estimated fee (exact location not found)',
            });
        }

        // Calculate actual distance and fee
        const distance = calculateDistance(
            pickupCoords.lat, pickupCoords.lng,
            deliveryCoords.lat, deliveryCoords.lng
        );
        const deliveryFee = calculateDeliveryFee(distance);

        // Rough time estimate based on distance
        let estimatedTime;
        if (distance <= 20) estimatedTime = '30-60 minutes';
        else if (distance <= 50) estimatedTime = '1-2 hours';
        else if (distance <= 100) estimatedTime = '2-4 hours';
        else estimatedTime = '4-8 hours';

        res.status(200).json({
            deliveryFee,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
            estimatedTime,
            message: 'Delivery quote calculated',
        });
    } catch (error) {
        console.error('Delivery quote error:', error);
        res.status(500).json({ message: 'Failed to calculate delivery fee' });
    }
});

// POST /api/delivery/dispatch - Request actual delivery via Uber Direct
// This would integrate with Uber Direct API in production
router.post('/dispatch', async (req, res) => {
    try {
        const { orderId, pickupAddress, deliveryAddress } = req.body;

        // In production, this would call the Uber Direct API
        // For now, we simulate a delivery being dispatched
        const mockDeliveryId = `DEL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        res.status(200).json({
            deliveryId: mockDeliveryId,
            status: 'dispatched',
            message: 'Delivery has been dispatched',
            estimatedPickup: new Date(Date.now() + 30 * 60 * 1000), // 30 min from now
        });
    } catch (error) {
        console.error('Dispatch error:', error);
        res.status(500).json({ message: 'Failed to dispatch delivery' });
    }
});

// GET /api/delivery/status/:deliveryId - Check delivery status
router.get('/status/:deliveryId', async (req, res) => {
    try {
        // In production, query Uber Direct API for real status
        res.status(200).json({
            deliveryId: req.params.deliveryId,
            status: 'dispatched',
            message: 'Delivery is on the way',
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get delivery status' });
    }
});

module.exports = router;
