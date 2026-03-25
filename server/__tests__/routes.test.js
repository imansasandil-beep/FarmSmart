/**
 * Route Integration Tests
 * =======================
 * Tests API endpoints using Supertest.
 * All database calls and external services are MOCKED so tests
 * never touch the real MongoDB or third-party APIs.
 */

const request = require('supertest');

// ── Mock Mongoose BEFORE importing the app ──
// This prevents any real database connections
jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        connect: jest.fn().mockResolvedValue(true),
        connection: {
            close: jest.fn(),
            on: jest.fn(),
            once: jest.fn(),
        },
    };
});

// ── Mock Clerk middleware so all routes are accessible in tests ──
jest.mock('@clerk/express', () => ({
    clerkMiddleware: () => (req, res, next) => next(),
    getAuth: () => ({ userId: 'test_clerk_user_123' }),
}));

// ── Mock PestDisease model ──
jest.mock('../models/PestDisease', () => {
    const mockFind = jest.fn();
    const Model = jest.fn();
    Model.find = mockFind;
    Model.schema = { paths: {}, obj: {} };
    return Model;
});

// ── Mock Listing model ──
jest.mock('../models/Listing', () => {
    const mockFind = jest.fn();
    const mockSave = jest.fn();
    const Model = jest.fn().mockImplementation((data) => ({
        ...data,
        save: mockSave.mockResolvedValue({ _id: 'mock_listing_id', ...data }),
    }));
    Model.find = mockFind;
    Model.findById = jest.fn();
    Model.schema = { paths: {}, obj: {} };
    return Model;
});

// ── Mock other models to prevent import errors ──
jest.mock('../models/User');
jest.mock('../models/Order');
jest.mock('../models/Notification');
jest.mock('../models/Question');
jest.mock('../models/Post');
jest.mock('../models/Review');
jest.mock('../models/Message');
jest.mock('../models/Comment');

// ── Mock external services ──
jest.mock('axios');
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        paymentIntents: { create: jest.fn() },
        checkout: { sessions: { create: jest.fn() } },
    }));
});
jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: { upload: jest.fn() },
    },
}));
jest.mock('multer', () => {
    const multer = jest.fn().mockImplementation(() => ({
        single: () => (req, res, next) => next(),
        array: () => (req, res, next) => next(),
    }));
    multer.memoryStorage = jest.fn().mockReturnValue({});
    multer.diskStorage = jest.fn().mockReturnValue({});
    return multer;
});
jest.mock('multer-storage-cloudinary', () => ({
    CloudinaryStorage: jest.fn().mockImplementation(() => ({})),
}));

// Now import the app
const app = require('../app');
const PestDisease = require('../models/PestDisease');

// ========================================
//  HEALTH CHECK
// ========================================
describe('GET / (Health Check)', () => {
    test('should return "FarmSmart API is running..."', async () => {
        const res = await request(app).get('/');

        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('FarmSmart API is running');
    });
});

// ========================================
//  PEST & DISEASE ROUTES
// ========================================
describe('Pest & Disease API', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/pest-diseases - should return all pest/disease records', async () => {
        const mockData = [
            { name: 'Brown Planthopper', type: 'Pest', affectedCrops: ['Rice'] },
            { name: 'Rice Blast', type: 'Disease', affectedCrops: ['Rice'] },
        ];

        // Mock the chained .sort() call
        PestDisease.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockData),
        });

        const res = await request(app).get('/api/pest-diseases');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].name).toBe('Brown Planthopper');
        expect(res.body[1].type).toBe('Disease');
        expect(PestDisease.find).toHaveBeenCalled();
    });

    test('GET /api/pest-diseases/search?q=Rice - should return matching records', async () => {
        const mockResults = [
            { name: 'Rice Blast', type: 'Disease', affectedCrops: ['Rice'] },
        ];

        PestDisease.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockResults),
        });

        const res = await request(app).get('/api/pest-diseases/search?q=Rice');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe('Rice Blast');
    });

    test('GET /api/pest-diseases/search - should return 400 if no query param', async () => {
        const res = await request(app).get('/api/pest-diseases/search');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('search query');
    });

    test('GET /api/pest-diseases - should return 500 on database error', async () => {
        PestDisease.find.mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error('DB connection failed')),
        });

        const res = await request(app).get('/api/pest-diseases');

        expect(res.statusCode).toBe(500);
        expect(res.body.message).toContain('DB connection failed');
    });
});

// ========================================
//  WEATHER ROUTES
// ========================================
describe('Weather API', () => {

    test('GET /api/weather - should return 400 if lat and lon are missing', async () => {
        const res = await request(app).get('/api/weather');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('lat and lon');
    });

    test('GET /api/weather?lat=6.9&lon=79.8 - should proxy weather data', async () => {
        const axios = require('axios');
        axios.get
            .mockResolvedValueOnce({ data: { temp: 30, weather: [{ main: 'Clear' }] } })  // current
            .mockResolvedValueOnce({ data: { list: [{ temp: 28 }] } });  // forecast

        const res = await request(app).get('/api/weather?lat=6.9&lon=79.8');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('current');
        expect(res.body).toHaveProperty('forecast');
    });
});

// ========================================
//  MARKETPLACE ROUTES
// ========================================
describe('Marketplace API', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/marketplace - should return listings', async () => {
        const Listing = require('../models/Listing');
        const mockListings = [
            { title: 'Fresh Tomatoes', price: 200 },
            { title: 'Organic Rice', price: 350 },
        ];

        Listing.find.mockReturnValue({
            populate: jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockListings),
            }),
        });

        const res = await request(app).get('/api/marketplace');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0].title).toBe('Fresh Tomatoes');
    });

    test('POST /api/marketplace/add - should return 400 if title is missing', async () => {
        const res = await request(app)
            .post('/api/marketplace/add')
            .send({ price: 200, sellerId: 'seller_123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('title');
    });

    test('POST /api/marketplace/add - should return 400 if price is missing', async () => {
        const res = await request(app)
            .post('/api/marketplace/add')
            .send({ title: 'Fresh Tomatoes', sellerId: 'seller_123' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('price');
    });
});

// ========================================
//  PAYMENT CALLBACK PAGES
// ========================================
describe('Payment Callback Pages', () => {

    test('GET /api/payments/checkout-cancel - should return cancel page', async () => {
        const res = await request(app).get('/api/payments/checkout-cancel');

        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Payment Cancelled');
    });

    test('GET /api/payments/connect-onboarding-return - should return success page', async () => {
        const res = await request(app).get('/api/payments/connect-onboarding-return');

        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Stripe Setup Complete');
    });

    test('GET /api/payments/connect-onboarding-refresh - should return expired page', async () => {
        const res = await request(app).get('/api/payments/connect-onboarding-refresh');

        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Link Expired');
    });
});
