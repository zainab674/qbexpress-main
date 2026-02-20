const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
