const { clerkClient, getAuth } = require('@clerk/express');

/**
 * Middleware to protect routes that require authentication.
 * Checks the Clerk session and attaches auth info to req.
 * Compatible with Express 5.x async middleware handling.
 * 
 * Usage: router.get('/profile', requireClerkAuth, handler)
 */
const requireClerkAuth = async (req, res, next) => {
    try {
        const auth = getAuth(req);
        const userId = auth?.userId || null;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Attach userId for easy access in route handlers
        req.clerkUserId = userId;
        next();
    } catch (error) {
        console.error('Clerk Auth Middleware Error:', error.message);
        return res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = { requireClerkAuth, clerkClient };
