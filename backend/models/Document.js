const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true }, // User's personal organization
    adminCategory: { type: String, required: true }, // Admin's original organization
    uploadedBy: { type: String, enum: ['admin', 'user'], required: true },
    fileData: { type: String, required: true }, // Base64 encoded file content
    fileType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);
