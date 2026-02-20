require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function simulateError() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the first user who is connected to QuickBooks
        const user = await User.findOne({ qbConnected: true });

        if (!user) {
            console.log('No connected QuickBooks user found to simulate error.');
            process.exit(0);
        }

        console.log(`Simulating token error for user: ${user.email}`);

        // Invalidate the tokens and set expiry to the past
        user.qbRefreshToken = 'invalid_refresh_token_for_testing';
        user.qbAccessToken = 'invalid_access_token_for_testing';
        user.qbTokenExpiry = new Date(Date.now() - 3600000); // 1 hour ago

        await user.save();

        console.log('Successfully invalidated QuickBooks tokens. Now visit the dashboard to see the fix in action.');
        console.log('The backend should catch the error, reset qbConnected to false, and the frontend should show the Connect button.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

simulateError();
