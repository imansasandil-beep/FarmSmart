const router = require('express').Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

/**
 * Image Upload Routes
 * Handles uploading product images to Cloudinary.
 * Falls back to a placeholder URL in dev mode if Cloudinary isn't configured.
 */

// Configure Cloudinary from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary configured with cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);

// Multer stores files in memory (we stream them straight to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Only accept image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

/**
 * Helper: Upload a buffer to Cloudinary using streams
 * We do this instead of saving to disk first - much cleaner
 */
const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'farmsmart/marketplace',
                resource_type: 'image',
                ...options,
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        // Pipe the buffer into the upload stream
        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};

// Handler for single image upload
const uploadImageHandler = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Check if Cloudinary is properly configured
        const isCloudinaryConfigured =
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET;

        if (!isCloudinaryConfigured) {
            // Dev mode fallback - return a placeholder URL
            console.log('Cloudinary not configured, using placeholder image');
            return res.status(200).json({
                url: 'https://via.placeholder.com/400x300/1a4d45/6fdfc4?text=Product+Image',
                message: 'Dev mode: using placeholder image',
            });
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, {
            transformation: [
                { width: 800, height: 600, crop: 'limit' }, // Resize to reasonable dimensions
                { quality: 'auto:good' }, // Auto-optimize quality
            ],
        });

        res.status(200).json({
            url: result.secure_url,
            publicId: result.public_id,
            message: 'Image uploaded successfully',
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload image' });
    }
};

// POST /api/upload - Upload an image (used by community posts)
router.post('/', upload.single('image'), uploadImageHandler);

// POST /api/upload/image - Upload an image (used by marketplace)
router.post('/image', upload.single('image'), uploadImageHandler);

// DELETE /api/upload/:publicId - Delete an image from Cloudinary
router.delete('/:publicId', async (req, res) => {
    try {
        const fullPublicId = `farmsmart/marketplace/${req.params.publicId}`;
        await cloudinary.uploader.destroy(fullPublicId);
        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete image' });
    }
});

module.exports = router;
