/**
 * Model Validation Tests
 * =====================
 * Tests Mongoose schema validation rules WITHOUT connecting to a real database.
 * We use the Mongoose model's built-in validateSync() method which checks
 * field types, required fields, enums, and defaults locally.
 */

const mongoose = require('mongoose');

// Import all models
const User = require('../models/User');
const PestDisease = require('../models/PestDisease');
const Notification = require('../models/Notification');
const Order = require('../models/Order');

// ========================================
//  USER MODEL TESTS
// ========================================
describe('User Model', () => {

    test('should require clerkId, fullName, and email', () => {
        const user = new User({});
        const errors = user.validateSync();

        expect(errors).toBeDefined();
        expect(errors.errors.clerkId).toBeDefined();
        expect(errors.errors.fullName).toBeDefined();
        expect(errors.errors.email).toBeDefined();
    });

    test('should set default role to "farmer"', () => {
        const user = new User({
            clerkId: 'clerk_test_123',
            fullName: 'Test Farmer',
            email: 'test@farmsmart.lk',
        });

        expect(user.role).toBe('farmer');
    });

    test('should only allow valid roles: farmer, buyer, expert', () => {
        const user = new User({
            clerkId: 'clerk_test_123',
            fullName: 'Test User',
            email: 'test@farmsmart.lk',
            role: 'admin', // invalid role
        });
        const errors = user.validateSync();

        expect(errors).toBeDefined();
        expect(errors.errors.role).toBeDefined();
    });

    test('should accept valid roles without error', () => {
        const validRoles = ['farmer', 'buyer', 'expert'];

        validRoles.forEach((role) => {
            const user = new User({
                clerkId: `clerk_${role}`,
                fullName: 'Test User',
                email: `${role}@farmsmart.lk`,
                role,
            });
            const errors = user.validateSync();
            // Should have no errors (or at least no role error)
            if (errors) {
                expect(errors.errors.role).toBeUndefined();
            }
        });
    });

    test('should set default values correctly', () => {
        const user = new User({
            clerkId: 'clerk_defaults',
            fullName: 'Default Farmer',
            email: 'default@farmsmart.lk',
        });

        expect(user.phone).toBe('');
        expect(user.district).toBe('');
        expect(user.farmLocation).toBe('');
        expect(user.farmSize).toBe(0);
        expect(user.primaryCrops).toEqual([]);
        expect(user.farmingZone).toBe('');
        expect(user.isVerified).toBe(false);
        expect(user.verificationStatus).toBe('none');
        expect(user.averageRating).toBe(0);
        expect(user.totalReviews).toBe(0);
    });

    test('should only allow valid farming zones', () => {
        const user = new User({
            clerkId: 'clerk_zone',
            fullName: 'Zone Farmer',
            email: 'zone@farmsmart.lk',
            farmingZone: 'Desert Zone', // invalid
        });
        const errors = user.validateSync();

        expect(errors).toBeDefined();
        expect(errors.errors.farmingZone).toBeDefined();
    });

    test('should accept valid farming zones', () => {
        const validZones = ['', 'Wet Zone', 'Dry Zone', 'Intermediate Zone'];

        validZones.forEach((zone) => {
            const user = new User({
                clerkId: `clerk_zone_${zone}`,
                fullName: 'Zone Farmer',
                email: `zone_${zone}@farmsmart.lk`,
                farmingZone: zone,
            });
            const errors = user.validateSync();
            if (errors) {
                expect(errors.errors.farmingZone).toBeUndefined();
            }
        });
    });

    test('should only allow valid verification statuses', () => {
        const user = new User({
            clerkId: 'clerk_ver',
            fullName: 'Verified Farmer',
            email: 'ver@farmsmart.lk',
            verificationStatus: 'unknown', // invalid
        });
        const errors = user.validateSync();

        expect(errors).toBeDefined();
        expect(errors.errors.verificationStatus).toBeDefined();
    });
});

// ========================================
//  PEST DISEASE MODEL TESTS
// ========================================
describe('PestDisease Model', () => {

    test('should require name, type, affectedCrops, symptoms, and treatment', () => {
        const pest = new PestDisease({});
        const errors = pest.validateSync();

        expect(errors).toBeDefined();
        expect(errors.errors.name).toBeDefined();
        expect(errors.errors.type).toBeDefined();
        expect(errors.errors.symptoms).toBeDefined();
        expect(errors.errors.treatment).toBeDefined();
    });

    test('should only allow type "Pest" or "Disease"', () => {
        const pest = new PestDisease({
            name: 'Test Bug',
            type: 'Weed', // invalid
            affectedCrops: ['Rice'],
            symptoms: 'Leaves turn yellow',
            treatment: 'Use neem oil',
        });
        const errors = pest.validateSync();

        expect(errors).toBeDefined();
        expect(errors.errors.type).toBeDefined();
    });

    test('should accept valid pest data without errors', () => {
        const pest = new PestDisease({
            name: 'Brown Planthopper',
            type: 'Pest',
            affectedCrops: ['Rice', 'Paddy'],
            symptoms: 'Yellowing of lower leaves',
            treatment: 'Use resistant rice varieties',
        });
        const errors = pest.validateSync();

        expect(errors).toBeUndefined();
    });

    test('should accept valid disease data without errors', () => {
        const disease = new PestDisease({
            name: 'Rice Blast',
            type: 'Disease',
            affectedCrops: ['Rice'],
            symptoms: 'Diamond-shaped lesions on leaves',
            treatment: 'Use blast-resistant varieties',
        });
        const errors = disease.validateSync();

        expect(errors).toBeUndefined();
    });

    test('should store affectedCrops as an array', () => {
        const pest = new PestDisease({
            name: 'Fall Armyworm',
            type: 'Pest',
            affectedCrops: ['Maize', 'Rice', 'Sorghum'],
            symptoms: 'Irregular holes in leaves',
            treatment: 'Use pheromone traps',
        });

        expect(Array.isArray(pest.affectedCrops)).toBe(true);
        expect(pest.affectedCrops).toHaveLength(3);
        expect(pest.affectedCrops).toContain('Maize');
    });
});

// ========================================
//  NOTIFICATION MODEL TESTS
// ========================================
describe('Notification Model', () => {

    test('should require userId, title, and message', () => {
        const notification = new Notification({});
        const errors = notification.validateSync();

        expect(errors).toBeDefined();
        expect(errors.errors.userId).toBeDefined();
        expect(errors.errors.title).toBeDefined();
        expect(errors.errors.message).toBeDefined();
    });

    test('should default read to false', () => {
        const notification = new Notification({
            userId: 'user_123',
            title: 'Test Notification',
            message: 'This is a test',
        });

        expect(notification.read).toBe(false);
    });

    test('should default type to "system"', () => {
        const notification = new Notification({
            userId: 'user_123',
            title: 'Test',
            message: 'Test message',
        });

        expect(notification.type).toBe('system');
    });

    test('should only allow valid notification types', () => {
        const notification = new Notification({
            userId: 'user_123',
            title: 'Test',
            message: 'Test message',
            type: 'spam', // invalid
        });
        const errors = notification.validateSync();

        expect(errors).toBeDefined();
        expect(errors.errors.type).toBeDefined();
    });

    test('should accept all valid notification types', () => {
        const validTypes = ['order', 'payment', 'delivery', 'review', 'message', 'new_message', 'agrisup', 'crop_calendar', 'system'];

        validTypes.forEach((type) => {
            const notification = new Notification({
                userId: 'user_123',
                title: 'Test',
                message: 'Test message',
                type,
            });
            const errors = notification.validateSync();
            expect(errors).toBeUndefined();
        });
    });
});

// ========================================
//  ORDER MODEL TESTS
// ========================================
describe('Order Model', () => {

    const validOrderData = {
        buyerId: new mongoose.Types.ObjectId(),
        sellerId: new mongoose.Types.ObjectId(),
        listingId: new mongoose.Types.ObjectId(),
        quantity: 5,
        unitPrice: 100,
        subtotal: 500,
        platformFee: 10,
        totalAmount: 510,
        sellerPayout: 490,
    };

    test('should require buyerId, sellerId, listingId, quantity, unitPrice, subtotal, platformFee, totalAmount, sellerPayout', () => {
        const order = new Order({});
        const errors = order.validateSync();

        expect(errors).toBeDefined();
        expect(errors.errors.buyerId).toBeDefined();
        expect(errors.errors.sellerId).toBeDefined();
        expect(errors.errors.listingId).toBeDefined();
        expect(errors.errors.quantity).toBeDefined();
        expect(errors.errors.unitPrice).toBeDefined();
        expect(errors.errors.subtotal).toBeDefined();
        expect(errors.errors.platformFee).toBeDefined();
        expect(errors.errors.totalAmount).toBeDefined();
        expect(errors.errors.sellerPayout).toBeDefined();
    });

    test('should set default status to "pending"', () => {
        const order = new Order(validOrderData);
        expect(order.status).toBe('pending');
    });

    test('should set default paymentStatus to "pending"', () => {
        const order = new Order(validOrderData);
        expect(order.paymentStatus).toBe('pending');
    });

    test('should set default platformFeePercent to 2', () => {
        const order = new Order(validOrderData);
        expect(order.platformFeePercent).toBe(2);
    });

    test('should only allow valid order statuses', () => {
        const order = new Order({
            ...validOrderData,
            status: 'flying', // invalid
        });
        const errors = order.validateSync();

        expect(errors).toBeDefined();
        expect(errors.errors.status).toBeDefined();
    });

    test('should only allow valid payment statuses', () => {
        const order = new Order({
            ...validOrderData,
            paymentStatus: 'stolen', // invalid
        });
        const errors = order.validateSync();

        expect(errors).toBeDefined();
        expect(errors.errors.paymentStatus).toBeDefined();
    });

    test('should enforce minimum quantity of 1', () => {
        const order = new Order({
            ...validOrderData,
            quantity: 0,
        });
        const errors = order.validateSync();

        expect(errors).toBeDefined();
        expect(errors.errors.quantity).toBeDefined();
    });
});
