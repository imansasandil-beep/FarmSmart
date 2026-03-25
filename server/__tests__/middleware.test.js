/**
 * Middleware Tests
 * ================
 * Tests the Clerk authentication middleware in isolation.
 * We mock the Clerk SDK to test both authenticated and unauthenticated scenarios.
 */

// ── Mock Clerk SDK ──
const mockGetAuth = jest.fn();
jest.mock('@clerk/express', () => ({
    clerkClient: {},
    getAuth: (...args) => mockGetAuth(...args),
}));

const { requireClerkAuth } = require('../middleware/clerkAuth');

// Helper to create mock Express req/res/next
const createMockReqResNext = () => {
    const req = {};
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();
    return { req, res, next };
};

// ========================================
//  CLERK AUTH MIDDLEWARE
// ========================================
describe('requireClerkAuth Middleware', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return 401 when no userId is present (unauthenticated)', async () => {
        const { req, res, next } = createMockReqResNext();

        // Simulate no authenticated user
        mockGetAuth.mockReturnValue({ userId: null });

        await requireClerkAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringContaining('Authentication') })
        );
        expect(next).not.toHaveBeenCalled();
    });

    test('should call next() and set req.clerkUserId when authenticated', async () => {
        const { req, res, next } = createMockReqResNext();

        // Simulate authenticated user
        mockGetAuth.mockReturnValue({ userId: 'user_abc123' });

        await requireClerkAuth(req, res, next);

        expect(req.clerkUserId).toBe('user_abc123');
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 401 when getAuth returns undefined', async () => {
        const { req, res, next } = createMockReqResNext();

        mockGetAuth.mockReturnValue(undefined);

        await requireClerkAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 when getAuth throws an error', async () => {
        const { req, res, next } = createMockReqResNext();

        mockGetAuth.mockImplementation(() => {
            throw new Error('Clerk service unavailable');
        });

        await requireClerkAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringContaining('Authentication') })
        );
        expect(next).not.toHaveBeenCalled();
    });
});
