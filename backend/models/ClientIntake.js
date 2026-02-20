const mongoose = require('mongoose');

const clientIntakeSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    accountingSystem: { type: String, required: true },
    bankName: { type: String, required: true },
    country: { type: String, required: true },
    teamSize: { type: String, required: true },
    revenue: { type: String, required: true },
    industry: { type: String, required: true },
    importantThing: { type: String, required: true },
    meetingSlot: { type: String },
    meetingDate: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emailSent: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClientIntake', clientIntakeSchema);
