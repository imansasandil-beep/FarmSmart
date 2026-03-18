const mongoose = require('mongoose');

const PestDiseaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['පළිබෝධ', 'රෝග'],
        required: true,
    },
    affectedCrops: {
        type: [String],
        required: true,
    },
    symptoms: {
        type: String,
        required: true,
    },
    treatment: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('PestDisease', PestDiseaseSchema);
