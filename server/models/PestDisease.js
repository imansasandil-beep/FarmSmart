const mongoose = require('mongoose');

const PestDiseaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Pest', 'Disease'],
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
});

module.exports = mongoose.model('PestDisease', PestDiseaseSchema);