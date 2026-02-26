const mongoose = require('mongoose');

const documentGroupSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    fullPath: {
        type: String,
        required: true
    },
    scope: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, { timestamps: true });

// Ensure a user can't have duplicate paths within the same scope
documentGroupSchema.index({ userId: 1, fullPath: 1, scope: 1 }, { unique: true });

module.exports = mongoose.model('DocumentGroup', documentGroupSchema);
