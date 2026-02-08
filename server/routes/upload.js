const router = require('express').Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary - try URL first, then individual vars
if (process.env.CLOUDINARY_URL) {
    // URL format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

// Log config for debugging (remove in production)
console.log('Cloudinary configured with cloud_name:', cloudinary.config().cloud_name);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder || 'farmsmart',
                resource_type: 'image',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto' },
                ],
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
    return (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
};

// Upload single image
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Check if Cloudinary is configured
        if (!isCloudinaryConfigured()) {
            // Return a placeholder URL in dev mode
            console.log('Cloudinary not configured, using placeholder');
            return res.status(200).json({
                url: 'https://via.placeholder.com/400x300.png?text=FarmSmart+Product',
                publicId: 'placeholder_' + Date.now(),
                devMode: true,
            });
        }

        const result = await uploadToCloudinary(req.file.buffer, 'farmsmart/listings');

        res.status(200).json({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: error.message || 'Failed to upload image' });
    }
});

// Delete image
router.delete('/image/:publicId', async (req, res) => {
    try {
        const { publicId } = req.params;

        if (!isCloudinaryConfigured()) {
            return res.status(200).json({ message: 'Image deleted (dev mode)' });
        }

        await cloudinary.uploader.destroy(publicId);
        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
