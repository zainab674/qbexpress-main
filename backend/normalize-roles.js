require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const result = await User.updateMany(
            { role: { $exists: true } },
            [{ $set: { role: { $toLower: "$role" } } }]
        );
        console.log(`Updated ${result.modifiedCount} users.`);
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
