const mongoose = require('mongoose');

const shortcutSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    groupName: { type: String, default: 'General' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shortcut', shortcutSchema);
