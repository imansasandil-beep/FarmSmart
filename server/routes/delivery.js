const router = require('express').Router();
const Order = require('../models/Order');
const Listing = require('../models/Listing');

// Note: Uber Direct SDK requires Node 18+
// For environments with older Node, we'll use fetch-based implementation
const UBER_BASE_URL = 'https://api.uber.com/v1/customers';

// Helper to get Uber access token
async function getUberAccessToken() {
    const response = await fetch('https://login.uber.com/oauth/v2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: process.env.UBER_DIRECT_CLIENT_ID,
            client_secret: process.env.UBER_DIRECT_CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'eats.deliveries',
        }),
    });
    const data = await response.json();
    return data.access_token;
}

// Get delivery quote
router.post('/quote', async (req, res) => {
    try {
        const { pickupAddress, dropoffAddress } = req.body;

        if (!pickupAddress || !dropoffAddress) {
            return res.status(400).json({ message: 'Pickup and dropoff addresses are required' });
        }

        const accessToken = await getUberAccessToken();
        const customerId = process.env.UBER_DIRECT_CUSTOMER_ID;

        const response = await fetch(`${UBER_BASE_URL}/${customerId}/delivery_quotes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pickup_address: JSON.stringify(pickupAddress),
                dropoff_address: JSON.stringify(dropoffAddress),
            }),
        });

        const quote = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: 'Failed to get delivery quote',
                error: quote
            });
        }

        res.status(200).json({
            quoteId: quote.id,
            fee: quote.fee / 100, // Convert cents to currency
            estimatedDeliveryTime: quote.estimated_delivery_time,
            expiresAt: quote.expires_at,
        });

    } catch (error) {
        console.error('Delivery Quote Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create delivery after payment confirmed
router.post('/create', async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId).populate('listingId');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.paymentStatus !== 'paid') {
            return res.status(400).json({ message: 'Payment not confirmed yet' });
        }

        const listing = order.listingId;
        const accessToken = await getUberAccessToken();
        const customerId = process.env.UBER_DIRECT_CUSTOMER_ID;

        // Format addresses
        const pickupAddress = listing.pickupAddress;
        const dropoffAddress = order.deliveryAddress;

        const response = await fetch(`${UBER_BASE_URL}/${customerId}/deliveries`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pickup_name: 'FarmSmart Seller',
                pickup_address: `${pickupAddress.street}, ${pickupAddress.city}, ${pickupAddress.state} ${pickupAddress.zipCode}`,
                pickup_phone_number: process.env.PLATFORM_CONTACT_PHONE || '+94000000000',
                dropoff_name: 'FarmSmart Buyer',
                dropoff_address: `${dropoffAddress.street}, ${dropoffAddress.city}, ${dropoffAddress.state} ${dropoffAddress.zipCode}`,
                dropoff_phone_number: process.env.PLATFORM_CONTACT_PHONE || '+94000000000',
                manifest_items: [{
                    name: listing.title,
                    quantity: order.quantity,
                    size: 'medium',
                }],
            }),
        });

        const delivery = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: 'Failed to create delivery',
                error: delivery
            });
        }

        // Update order with delivery info
        order.uberDeliveryId = delivery.id;
        order.deliveryStatus = 'dispatched';
        order.status = 'processing';
        await order.save();

        res.status(200).json({
            deliveryId: delivery.id,
            trackingUrl: delivery.tracking_url,
            status: delivery.status,
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
        if (!order || !order.uberDeliveryId) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        const accessToken = await getUberAccessToken();
        const customerId = process.env.UBER_DIRECT_CUSTOMER_ID;

        const response = await fetch(
            `${UBER_BASE_URL}/${customerId}/deliveries/${order.uberDeliveryId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        const delivery = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: 'Failed to get delivery status',
                error: delivery
            });
        }

        // Update local status
        order.deliveryStatus = delivery.status;
        if (delivery.status === 'delivered') {
            order.status = 'delivered';
        }
        await order.save();

        res.status(200).json({
            status: delivery.status,
            trackingUrl: delivery.tracking_url,
            courier: delivery.courier ? {
                name: delivery.courier.name,
                phone: delivery.courier.phone_number,
                location: delivery.courier.location,
            } : null,
            estimatedDeliveryTime: delivery.dropoff_eta,
        });

    } catch (error) {
        console.error('Delivery Status Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
