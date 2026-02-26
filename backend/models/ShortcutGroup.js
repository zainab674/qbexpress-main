const mongoose = require('mongoose');

const shortcutGroupSchema = new mongoose.Schema({
    userId: {
        type: String,
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
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ensure a user can't have duplicate paths
shortcutGroupSchema.index({ userId: 1, fullPath: 1 }, { unique: true });

module.exports = mongoose.model('ShortcutGroup', shortcutGroupSchema);
