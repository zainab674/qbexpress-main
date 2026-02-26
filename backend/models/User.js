const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    company: { type: String },
    phone: { type: String },
    password: { type: String, required: true }, // In a real app, hash this! but for now simple storage as requested/implied for quick setup.
    qbAccessToken: { type: String },
    qbRefreshToken: { type: String },
    qbRealmId: { type: String },
    qbTokenExpiry: { type: Date },
    qbConnected: { type: Boolean, default: false },
    selectedWidgets: {
        type: [String],
        default: ['profitAndLoss', 'expensesCard', 'cashFlow', 'accounts', 'customerStatus', 'vendorStatus', 'arAging', 'apAging', 'salesReport', 'accountDetails']
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
