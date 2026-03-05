const { clerkClient, getAuth } = require('@clerk/express');

/**
 * Middleware to protect routes that require authentication.
 * Checks the Clerk session and attaches auth info to req.
 * 
 * Usage: router.get('/profile', requireClerkAuth, handler)
 */
const requireClerkAuth = (req, res, next) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    // Attach userId for easy access in route handlers
    req.clerkUserId = userId;
    next();
};

module.exports = { requireClerkAuth, clerkClient };
