require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const OAuthClient = require('intuit-oauth');

const User = require('./models/User');
const ClientIntake = require('./models/ClientIntake');
const Report = require('./models/Report');
const Shortcut = require('./models/Shortcut');
const ShortcutGroup = require('./models/ShortcutGroup');
const Contact = require('./models/Contact');
const Document = require('./models/Document');
const DocumentGroup = require('./models/DocumentGroup');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes

// 1. Client Intake
app.post('/api/intake', async (req, res) => {
    try {
        const intake = new ClientIntake(req.body);
        await intake.save();
        res.status(201).json({ message: 'Form submitted successfully' });
    } catch (error) {
        console.error('Intake error:', error);
        res.status(500).json({ message: 'Error submitting form', error: error.message });
    }
});

// 1b. Contact Inquiries
app.post('/api/contact', async (req, res) => {
    try {
        const contact = new Contact(req.body);
        await contact.save();
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
});

// 2. Reports
app.post('/api/reports', async (req, res) => {
    try {
        const { userId, fileName, data } = req.body;
        if (!userId || !fileName || !data) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const report = new Report({ userId, fileName, data });
        await report.save();
        res.status(201).json({ message: 'Report saved successfully' });
    } catch (error) {
        console.error('Report save error:', error);
        res.status(500).json({ message: 'Error saving report', error: error.message });
    }
});

app.get('/api/reports/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const reports = await Report.find({ userId }).sort({ uploadedAt: -1 });
        res.json(reports);
    } catch (error) {
        console.error('Fetch reports error:', error);
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
});

// 3. Shortcuts
app.post('/api/shortcuts', async (req, res) => {
    try {
        const { userId, name, url, groupName } = req.body;
        if (!userId || !name || !url) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const shortcut = new Shortcut({ userId, name, url, groupName });
        await shortcut.save();
        res.status(201).json(shortcut);
    } catch (error) {
        console.error('Shortcut save error:', error);
        res.status(500).json({ message: 'Error saving shortcut', error: error.message });
    }
});

app.get('/api/shortcuts/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        let shortcuts = await Shortcut.find({ userId }).sort({ groupName: 1 });

        if (shortcuts.length === 0) {
            const defaults = [
                { userId, name: 'Email', url: 'https://mail.google.com', groupName: 'Communication' },
                { userId, name: 'WhatsApp', url: 'https://web.whatsapp.com', groupName: 'Communication' }
            ];
            shortcuts = await Shortcut.insertMany(defaults);
        }

        res.json(shortcuts);
    } catch (error) {
        console.error('Fetch shortcuts error:', error);
        res.status(500).json({ message: 'Error fetching shortcuts', error: error.message });
    }
});

app.delete('/api/shortcuts/:id', async (req, res) => {
    try {
        await Shortcut.findByIdAndDelete(req.params.id);
        res.json({ message: 'Shortcut deleted' });
    } catch (error) {
        console.error('Delete shortcut error:', error);
        res.status(500).json({ message: 'Error deleting shortcut', error: error.message });
    }
});

// 3b. Shortcut Groups (Folders)
app.get('/api/shortcut-groups/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        let groups = await ShortcutGroup.find({ userId });
        const shortcuts = await Shortcut.find({ userId }).select('groupName');

        const shortcutGroupNames = [...new Set(shortcuts.map(s => s.groupName || 'General'))];
        const existingPaths = new Set(groups.map(g => g.fullPath));

        // Add missing shortcut group names to the result
        shortcutGroupNames.forEach(path => {
            if (!existingPaths.has(path)) {
                groups.push({
                    userId,
                    name: path.split('/').pop(),
                    fullPath: path,
                    isDefault: false,
                    _id: 'derived-' + Math.random().toString(36).substr(2, 9) // Temporary ID for frontend
                });
                existingPaths.add(path);
            }
        });

        // Initialize defaults if absolutely no groups or shortcuts exist
        if (groups.length === 0) {
            const defaults = [
                { userId, name: 'General', fullPath: 'General', isDefault: true },
                { userId, name: 'Finance', fullPath: 'Finance', isDefault: true },
                { userId, name: 'Banks', fullPath: 'Finance/Banks', isDefault: true },
                { userId, name: 'Communication', fullPath: 'Communication', isDefault: true }
            ];
            groups = await ShortcutGroup.insertMany(defaults);
        }

        // Sort groups by path for better dropdown experience
        groups.sort((a, b) => a.fullPath.localeCompare(b.fullPath));

        res.json(groups);
    } catch (error) {
        console.error('Fetch shortcut groups error:', error);
        res.status(500).json({ message: 'Error fetching shortcut groups', error: error.message });
    }
});

app.post('/api/shortcut-groups', async (req, res) => {
    try {
        const { userId, name, fullPath } = req.body;
        if (!userId || !name || !fullPath) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if group already exists
        const existing = await ShortcutGroup.findOne({ userId, fullPath });
        if (existing) return res.json(existing);

        const group = new ShortcutGroup({ userId, name, fullPath });
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        console.error('Shortcut group save error:', error);
        res.status(500).json({ message: 'Error saving shortcut group', error: error.message });
    }
});

app.delete('/api/shortcut-groups/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { path } = req.query;
        if (!userId || !path) {
            return res.status(400).json({ message: 'Missing userId or path' });
        }

        // 1. Delete the groups (itself and subfolders)
        const pathRegex = new RegExp('^' + path.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '(/|$)');
        await ShortcutGroup.deleteMany({ userId, fullPath: { $regex: pathRegex } });

        // 2. Delete the shortcuts inside
        await Shortcut.deleteMany({ userId, groupName: { $regex: pathRegex } });

        res.json({ message: 'Shortcut group and contents deleted' });
    } catch (error) {
        console.error('Delete shortcut group error:', error);
        res.status(500).json({ message: 'Error deleting shortcut group', error: error.message });
    }
});

app.patch('/api/shortcuts/:id', async (req, res) => {
    try {
        const { name, url, groupName } = req.body;
        const updated = await Shortcut.findByIdAndUpdate(
            req.params.id,
            { name, url, groupName },
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        console.error('Update shortcut error:', error);
        res.status(500).json({ message: 'Error updating shortcut', error: error.message });
    }
});

app.patch('/api/shortcut-groups/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { oldPath, newPath } = req.body;

        if (!oldPath || !newPath) {
            return res.status(400).json({ message: 'Missing oldPath or newPath' });
        }

        // 1. Update the group itself (if it exists in DB)
        const group = await ShortcutGroup.findOne({ userId, fullPath: oldPath });
        if (group) {
            group.name = newPath.split('/').pop();
            group.fullPath = newPath;
            await group.save();
        }

        // 2. Update all subfolders
        const subfolders = await ShortcutGroup.find({
            userId,
            fullPath: { $regex: new RegExp('^' + oldPath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '/') }
        });

        for (const sub of subfolders) {
            sub.fullPath = sub.fullPath.replace(oldPath, newPath);
            await sub.save();
        }

        // 3. Update all shortcuts
        const shortcuts = await Shortcut.find({
            userId,
            groupName: { $regex: new RegExp('^' + oldPath.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '(/|$)') }
        });

        for (const s of shortcuts) {
            s.groupName = s.groupName.replace(oldPath, newPath);
            await s.save();
        }

        res.json({ message: 'Folder renamed successfully' });
    } catch (error) {
        console.error('Rename folder error:', error);
        res.status(500).json({ message: 'Error renaming folder', error: error.message });
    }
});


// 2. Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ email, password, name });
        await user.save();

        res.status(201).json({ message: 'User created successfully', user: { email: user.email, id: user._id, name: user.name, role: user.role } });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// 3. Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password (simple comparison as per quick setup, ideally use bcrypt)
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            message: 'Login successful',
            user: {
                email: user.email,
                id: user._id,
                name: user.name,
                company: user.company,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// User Widget Selection
app.get('/api/users/:userId/widgets', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ selectedWidgets: user.selectedWidgets });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching widgets', error: error.message });
    }
});

app.put('/api/users/:userId/widgets', async (req, res) => {
    try {
        const { selectedWidgets } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { selectedWidgets },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ selectedWidgets: user.selectedWidgets });
    } catch (error) {
        res.status(500).json({ message: 'Error updating widgets', error: error.message });
    }
});

// Admin: Get all users
app.get('/api/users/all', async (req, res) => {
    try {
        const { adminId } = req.query;
        if (!adminId) {
            return res.status(400).json({ message: 'Admin ID required' });
        }

        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        const users = await User.find({}, '-password -qbAccessToken -qbRefreshToken'); // Exclude sensitive info
        res.json(users);
    } catch (error) {
        console.error('Fetch all users error:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Admin: Update user role
app.patch('/api/users/:targetUserId/role', async (req, res) => {
    try {
        const { adminId } = req.query;
        const { targetUserId } = req.params;
        const { role } = req.body;

        if (!adminId || !role) {
            return res.status(400).json({ message: 'Admin ID and new role are required' });
        }

        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        const user = await User.findByIdAndUpdate(
            targetUserId,
            { role: role.toLowerCase() },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User role updated', user: { email: user.email, role: user.role } });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Error updating user role', error: error.message });
    }
});

// Admin/User: Upload document
app.post('/api/documents/upload', async (req, res) => {
    try {
        const { adminId } = req.query; // Admin is performing upload
        const { userId, name, category, fileData, fileType } = req.body;

        if (!userId || !name || !category || !fileData || !fileType) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // If adminId is provided, verify admin privileges
        let uploadedBy = 'user';
        let adminCategory = '[Sent to Admin]';
        let userCategory = category;

        if (adminId) {
            const admin = await User.findById(adminId);
            if (!admin || admin.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
            }
            uploadedBy = 'admin';
            adminCategory = category; // Original categorization by admin
        } else {
            // User upload: specifically to admin
            adminCategory = '[Sent to Admin]';
            userCategory = '[Sent to Admin]';
        }

        const document = new Document({
            userId,
            name,
            category: userCategory,
            adminCategory,
            uploadedBy,
            fileData,
            fileType
        });

        await document.save();
        res.status(201).json({ message: 'Document uploaded successfully', document: { _id: document._id, name: document.name } });
    } catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({ message: 'Error uploading document', error: error.message });
    }
});

// Admin/User: Get documents for a user
app.get('/api/documents/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const documents = await Document.find({ userId }, '-fileData'); // Exclude fileData for list
        res.json(documents);
    } catch (error) {
        console.error('Fetch documents error:', error);
        res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
});

// Admin/User: Get specific document with data
app.get('/api/documents/download/:docId', async (req, res) => {
    try {
        const { docId } = req.params;
        const document = await Document.findById(docId);
        if (!document) return res.status(404).json({ message: 'Document not found' });
        res.json(document);
    } catch (error) {
        console.error('Download document error:', error);
        res.status(500).json({ message: 'Error downloading document', error: error.message });
    }
});

// Admin/User: Update document category (move to folder)
app.patch('/api/documents/:docId/category', async (req, res) => {
    try {
        const { docId } = req.params;
        const { category, scope = 'user' } = req.body; // scope: 'user' or 'admin'

        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        const updateData = scope === 'admin'
            ? { adminCategory: category }
            : { category: category };

        const document = await Document.findByIdAndUpdate(
            docId,
            updateData,
            { new: true }
        );

        if (!document) return res.status(404).json({ message: 'Document not found' });

        res.json({ message: 'Document reorganized successfully', document });
    } catch (error) {
        console.error('Update document category error:', error);
        res.status(500).json({ message: 'Error updating document category', error: error.message });
    }
});

// Admin/User: Bulk rename category (Rename Folder)
app.patch('/api/documents/category/rename', async (req, res) => {
    try {
        const { userId, oldCategory, newCategory, scope = 'user' } = req.body;

        if (!userId || !oldCategory || !newCategory) {
            return res.status(400).json({ message: 'userId, oldCategory, and newCategory are required' });
        }

        const filter = scope === 'admin'
            ? { userId, adminCategory: oldCategory }
            : { userId, category: oldCategory };

        const update = scope === 'admin'
            ? { adminCategory: newCategory }
            : { category: newCategory };

        const result = await Document.updateMany(filter, update);

        res.json({
            message: 'Folder renamed successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Bulk rename category error:', error);
        res.status(500).json({ message: 'Error renaming folder', error: error.message });
    }
});

// Admin/User: Document Groups (Persistent Folders)
app.get('/api/document-groups/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { scope = 'user' } = req.query;
        const groups = await DocumentGroup.find({ userId, scope });
        res.json(groups);
    } catch (error) {
        console.error('Fetch document groups error:', error);
        res.status(500).json({ message: 'Error fetching document groups', error: error.message });
    }
});

app.post('/api/document-groups', async (req, res) => {
    try {
        const { userId, name, fullPath, scope = 'user' } = req.body;
        if (!userId || !name || !fullPath) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if group already exists
        const existing = await DocumentGroup.findOne({ userId, fullPath, scope });
        if (existing) return res.json(existing);

        const group = new DocumentGroup({ userId, name, fullPath, scope });
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        console.error('Document group save error:', error);
        res.status(500).json({ message: 'Error saving document group', error: error.message });
    }
});

app.delete('/api/document-groups/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { path, scope = 'user' } = req.query;
        if (!userId || !path) {
            return res.status(400).json({ message: 'Missing userId or path' });
        }

        // Delete the group
        await DocumentGroup.deleteOne({ userId, fullPath: path, scope });

        // Note: We don't delete documents, they just become uncategorized if they matched this path
        // But our UI logic handles "uncategorized" as fallback.
        // If we wanted to bulk update documents to "uncategorized", we could do updateMany here.
        const filter = scope === 'admin' ? { userId, adminCategory: path } : { userId, category: path };
        const update = scope === 'admin' ? { adminCategory: 'uncategorized' } : { category: 'uncategorized' };
        await Document.updateMany(filter, update);

        res.json({ message: 'Document group deleted' });
    } catch (error) {
        console.error('Delete document group error:', error);
        res.status(500).json({ message: 'Error deleting document group', error: error.message });
    }
});

app.patch('/api/document-groups/rename', async (req, res) => {
    try {
        const { userId, oldCategory, newCategory, scope = 'user' } = req.body;
        if (!userId || !oldCategory || !newCategory) {
            return res.status(400).json({ message: 'userId, oldCategory, and newCategory are required' });
        }

        // 1. Update the group record if it exists
        await DocumentGroup.findOneAndUpdate(
            { userId, fullPath: oldCategory, scope },
            { name: newCategory, fullPath: newCategory }
        );

        // 2. Update all documents in this category
        const filter = scope === 'admin' ? { userId, adminCategory: oldCategory } : { userId, category: oldCategory };
        const update = scope === 'admin' ? { adminCategory: newCategory } : { category: newCategory };
        await Document.updateMany(filter, update);

        res.json({ message: 'Folder and documents renamed successfully' });
    } catch (error) {
        console.error('Rename document group error:', error);
        res.status(500).json({ message: 'Error renaming folder', error: error.message });
    }
});

// Helper to get a configured QuickBooks client and handle token refresh with locking
const refreshPromises = new Map();

async function getQuickBooksClient(userId) {
    // If a refresh is already in progress for this user, return the existing promise
    if (refreshPromises.has(userId)) {
        console.log(`Waiting for existing refresh for user ${userId}...`);
        return refreshPromises.get(userId);
    }

    const refreshTask = async () => {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        if (!user.qbConnected) throw new Error('User not connected to QuickBooks');

        const client = new OAuthClient({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            environment: process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox',
            redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || 'http://localhost:5000/api/quickbooks/callback'
        });

        client.setToken({
            access_token: user.qbAccessToken,
            refresh_token: user.qbRefreshToken,
            realmId: user.qbRealmId,
            expires_in: Math.floor((new Date(user.qbTokenExpiry) - Date.now()) / 1000),
            x_refresh_token_expires_in: 8640000 // 100 days
        });

        if (client.isAccessTokenValid()) {
            return { client, user };
        }

        console.log(`Refreshing QuickBooks token for user ${userId}...`);
        try {
            const authResponse = await client.refresh();
            const { access_token, refresh_token, expires_in } = authResponse.token;

            const updatedUser = await User.findByIdAndUpdate(userId, {
                qbAccessToken: access_token,
                qbRefreshToken: refresh_token,
                qbTokenExpiry: new Date(Date.now() + expires_in * 1000),
                qbConnected: true
            }, { new: true });

            console.log(`Token refreshed successfully for user ${userId}`);
            return { client, user: updatedUser };
        } catch (error) {
            console.error(`Error refreshing token for user ${userId}:`, error.message);
            if (error.message?.includes('Refresh token is invalid')) {
                await User.findByIdAndUpdate(userId, { qbConnected: false });
            }
            throw error;
        }
    };

    const promise = refreshTask();
    refreshPromises.set(userId, promise);

    try {
        return await promise;
    } finally {
        refreshPromises.delete(userId);
    }
}

// 4. QuickBooks OAuth Routes

// 4a. Authentication Route
app.get('/api/quickbooks/auth', (req, res) => {
    const { userId } = req.query;
    // Use a fresh client instance for auth
    const client = new OAuthClient({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        environment: process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox',
        redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || 'http://localhost:5000/api/quickbooks/callback'
    });

    const authUri = client.authorizeUri({
        scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
        state: userId || 'testState',
    });
    res.json({ authUri });
});

// 4b. Callback Route
app.get('/api/quickbooks/callback', async (req, res) => {
    try {
        // Use a fresh client instance for callback
        const client = new OAuthClient({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            environment: process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox',
            redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || 'http://localhost:5000/api/quickbooks/callback'
        });

        const authResponse = await client.createToken(req.url);
        const { access_token, refresh_token, expires_in } = authResponse.token;
        const realmId = req.query.realmId;
        const userId = req.query.state;

        if (userId) {
            await User.findByIdAndUpdate(userId, {
                qbAccessToken: access_token,
                qbRefreshToken: refresh_token,
                qbRealmId: realmId,
                qbTokenExpiry: new Date(Date.now() + expires_in * 1000),
                qbConnected: true
            });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        res.redirect(`${frontendUrl}/dashboard?status=success`);
    } catch (error) {
        console.error('QuickBooks Callback Error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://frontend:8081'; // Fallback if localhost fails in docker/env
        res.redirect(`${frontendUrl}/dashboard?status=error`);
    }
});

// 4c. Connection Status
app.get('/api/quickbooks/status/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ connected: user.qbConnected || false });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching status', error: error.message });
    }
});

// 4d. Granular Report / Entity APIs for Detail Pages
app.get('/api/quickbooks/reports/:reportName/:userId', async (req, res) => {
    try {
        const { client, user } = await getQuickBooksClient(req.params.userId);
        const realmId = user.qbRealmId;
        const { reportName } = req.params;
        const baseUrl = client.environment === 'sandbox'
            ? 'https://sandbox-quickbooks.api.intuit.com'
            : 'https://quickbooks.api.intuit.com';

        // Filter and pass through relevant query params
        const allowedParams = ['start_date', 'end_date', 'summarize_column_by', 'accounting_method', 'as_of_date', 'past_due_only', 'minorversion'];
        const queryParams = new URLSearchParams();
        Object.keys(req.query).forEach(key => {
            if (allowedParams.includes(key)) {
                queryParams.append(key, req.query[key]);
            }
        });

        const url = `${baseUrl}/v3/company/${realmId}/reports/${reportName}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

        console.log(`Fetching specific report ${reportName} for user ${user.email}`);
        const response = await client.makeApiCall({
            url,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(response.json);
    } catch (error) {
        console.error(`Error fetching report ${req.params.reportName}:`, error);
        res.status(500).json({ message: 'Error fetching report', error: error.message });
    }
});

app.get('/api/quickbooks/accounts/:userId', async (req, res) => {
    try {
        const { client, user } = await getQuickBooksClient(req.params.userId);
        const realmId = user.qbRealmId;
        const baseUrl = client.environment === 'sandbox'
            ? 'https://sandbox-quickbooks.api.intuit.com'
            : 'https://quickbooks.api.intuit.com';

        // Fetch Accounts and Banking Feed in parallel
        const [accountsResponse, bankingRes] = await Promise.allSettled([
            client.makeApiCall({
                url: `${baseUrl}/v3/company/${realmId}/query?query=select * from Account where AccountType in ('Bank', 'Credit Card')`,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }),
            client.makeApiCall({
                url: `${baseUrl}/v3/company/${realmId}/banking/accounts?minorversion=75`,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
        ]);

        const ledgerAccounts = accountsResponse.status === 'fulfilled' ? (accountsResponse.value.json?.QueryResponse?.Account || []) : [];
        const bankingAccounts = bankingRes.status === 'fulfilled' ? (bankingRes.value.json?.accounts || []) : [];

        const bankingMap = {};
        bankingAccounts.forEach(acc => { bankingMap[acc.qboAccountId] = acc; });

        const mergedAccounts = ledgerAccounts.map(acc => {
            const feed = bankingMap[acc.Id];
            return {
                ...acc,
                bankBalance: (feed && feed.bankBalance !== undefined) ? feed.bankBalance : (acc.BankBalance || acc.CurrentBalance || 0),
                qboBalance: acc.CurrentBalance || 0,
                unmatchedCount: feed ? feed.unmatchedCount : 0,
                fiName: feed ? feed.fiName : null,
                connectionType: feed ? feed.connectionType : "DISCONNECTED"
            };
        });

        res.json(mergedAccounts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching accounts', error: error.message });
    }
});

// 4e. Business Overview Data (Refactored for performance)
app.get('/api/quickbooks/business-overview/:userId', async (req, res) => {
    try {
        const { client, user } = await getQuickBooksClient(req.params.userId);

        const realmId = user.qbRealmId;
        const baseUrl = client.environment === 'sandbox'
            ? 'https://sandbox-quickbooks.api.intuit.com'
            : 'https://quickbooks.api.intuit.com';

        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const formatDate = (date) => date.toISOString().split('T')[0];
        const start = formatDate(thirtyDaysAgo);
        const end = formatDate(today);
        const currentYearStart = formatDate(new Date(today.getFullYear(), 0, 1));
        const oneYearAgoFormatted = formatDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));

        console.log(`Fetching business overview for ${user.email} (parallel mode)`);

        // Helper for API calls to use with Promise.all
        const call = (url) => client.makeApiCall({ url, method: 'GET', headers: { 'Content-Type': 'application/json' } });

        const requests = {
            pnl: call(`${baseUrl}/v3/company/${realmId}/reports/ProfitAndLoss?start_date=${start}&end_date=${end}&summarize_column_by=Month`),
            sales: call(`${baseUrl}/v3/company/${realmId}/reports/ProfitAndLoss?start_date=${currentYearStart}&end_date=${end}&summarize_column_by=Month`),
            cashFlow: call(`${baseUrl}/v3/company/${realmId}/reports/CashFlow?start_date=${start}&end_date=${end}&accounting_method=Cash`),
            accounts: call(`${baseUrl}/v3/company/${realmId}/query?query=select * from Account where AccountType in ('Bank', 'Credit Card')`),
            banking: call(`${baseUrl}/v3/company/${realmId}/banking/accounts?minorversion=75`).catch(() => ({ json: { accounts: [] } })),
            reviewTxns: call(`${baseUrl}/v3/company/${realmId}/reports/TransactionList?txn_status=ForReview&start_date=${start}&end_date=${end}`),
            balanceSheet: call(`${baseUrl}/v3/company/${realmId}/reports/BalanceSheet?accounting_method=Cash&as_of_date=${end}`),
            arAging: call(`${baseUrl}/v3/company/${realmId}/reports/AgedReceivableSummary?past_due_only=false`),
            apAging: call(`${baseUrl}/v3/company/${realmId}/reports/AgedPayableSummary?past_due_only=false`),
            apAgingDetail: call(`${baseUrl}/v3/company/${realmId}/reports/AgedPayableDetail?past_due_only=false`),
            arAgingDetail: call(`${baseUrl}/v3/company/${realmId}/reports/AgedReceivableDetail?past_due_only=false`),
            unpaidInvoices: call(`${baseUrl}/v3/company/${realmId}/query?query=select * from Invoice where Balance > '0' AND TxnDate >= '${oneYearAgoFormatted}'`),
            recentPayments: call(`${baseUrl}/v3/company/${realmId}/query?query=select * from Payment where TxnDate >= '${start}'`),
            recentSalesReceipts: call(`${baseUrl}/v3/company/${realmId}/query?query=select * from SalesReceipt where TxnDate >= '${start}'`),
            allAccounts: call(`${baseUrl}/v3/company/${realmId}/query?query=select * from Account`),
            recentBillPayments: call(`${baseUrl}/v3/company/${realmId}/query?query=select * from BillPayment where TxnDate >= '${start}'`),
            recentPurchases: call(`${baseUrl}/v3/company/${realmId}/query?query=select * from Purchase where TxnDate >= '${start}'`),
            companyInfo: call(`${baseUrl}/v3/company/${realmId}/companyinfo/${realmId}?minorversion=75`)
        };

        const results = await Promise.allSettled(Object.values(requests));
        const keys = Object.keys(requests);
        const data = {};

        results.forEach((res, idx) => {
            data[keys[idx]] = res.status === 'fulfilled' ? res.value.json : null;
        });

        // Processing logic (Keep it as it was but mapped from 'data')
        const pnlData = data.pnl;
        const salesReportData = data.sales;
        const cashFlowData = data.cashFlow;
        const ledgerAccounts = data.accounts?.QueryResponse?.Account || [];
        const bankingAccounts = data.banking?.accounts || [];
        const reviewTransactionsData = data.reviewTxns;

        const bankingMap = {};
        bankingAccounts.forEach(acc => { bankingMap[acc.qboAccountId] = acc; });

        const reportToReviewCounts = {};
        if (bankingAccounts.length === 0 && reviewTransactionsData && reviewTransactionsData.Rows && reviewTransactionsData.Rows.Row) {
            const accountColIndex = reviewTransactionsData.Columns?.Column?.findIndex(c => c.ColTitle === 'Account' || c.ColType === 'Account') ?? -1;
            if (accountColIndex !== -1) {
                reviewTransactionsData.Rows.Row.forEach(row => {
                    if (row.ColData && row.ColData[accountColIndex]) {
                        const accountName = row.ColData[accountColIndex].value;
                        if (accountName) reportToReviewCounts[accountName] = (reportToReviewCounts[accountName] || 0) + 1;
                    }
                });
            }
        }

        const mergedAccounts = ledgerAccounts.map(acc => {
            const feed = bankingMap[acc.Id];
            const unmatchedCount = (feed && feed.unmatchedCount !== undefined) ? feed.unmatchedCount : (reportToReviewCounts[acc.Name] || 0);
            return {
                ...acc,
                bankBalance: (feed && feed.bankBalance !== undefined) ? feed.bankBalance : (acc.BankBalance || acc.CurrentBalance || 0),
                qboBalance: acc.CurrentBalance || 0,
                unmatchedCount: unmatchedCount,
                fiName: feed ? feed.fiName : null,
                connectionType: feed ? feed.connectionType : "DISCONNECTED",
                lastUpdateTime: feed ? feed.lastUpdateTime : null
            };
        });

        const undepositedAccounts = (data.allAccounts?.QueryResponse?.Account || []).filter(a =>
            a.AccountSubType === 'UndepositedFunds' || a.Name.includes('Undeposited') || a.Name.includes('Payments to deposit')
        );
        const undepositedAccountIds = undepositedAccounts.map(a => a.Id);

        const invoiceStatus = { unpaidAmount: 0, overdueAmount: 0, notDueYetAmount: 0, paidAmount: 0, depositedAmount: 0, notDepositedAmount: 0 };
        const arAgingData = data.arAging;

        if (arAgingData && arAgingData.Rows && arAgingData.Rows.Row) {
            const summaryRow = arAgingData.Rows.Row.find(r =>
                r.id === 'TOTAL' ||
                (r.Summary && r.Summary.ColData &&
                    (r.Summary.ColData[0].value?.toLowerCase() === 'total' || r.Summary.ColData[0].value?.toLowerCase().includes('total')))
            );

            if (summaryRow?.Summary?.ColData) {
                const cols = summaryRow.Summary.ColData;
                const columns = arAgingData.Columns?.Column || [];
                const findColIdx = (text) => columns.findIndex(c => c.ColTitle?.toLowerCase().includes(text.toLowerCase()));

                const currentIdx = findColIdx("current");
                const totalIdx = findColIdx("total") !== -1 ? findColIdx("total") : cols.length - 1;

                const totalAmt = parseFloat(cols[totalIdx]?.value || 0);
                const currentAmt = currentIdx !== -1 ? parseFloat(cols[currentIdx]?.value || 0) : 0;

                invoiceStatus.unpaidAmount = totalAmt;
                invoiceStatus.notDueYetAmount = currentAmt;
                invoiceStatus.overdueAmount = totalAmt - currentAmt;
            }
        }

        const processPaidItem = (item) => {
            const amount = parseFloat(item.TotalAmt || 0);
            invoiceStatus.paidAmount += amount;
            if (undepositedAccountIds.includes(item.DepositToAccountRef?.value)) invoiceStatus.notDepositedAmount += amount;
            else invoiceStatus.depositedAmount += amount;
        };
        (data.recentPayments?.QueryResponse?.Payment || []).forEach(processPaidItem);
        (data.recentSalesReceipts?.QueryResponse?.SalesReceipt || []).forEach(processPaidItem);

        const vendorStatus = { unpaidAmount: 0, overdueAmount: 0, notDueYetAmount: 0, paidAmount: 0 };
        const apAgingData = data.apAging;
        if (apAgingData && apAgingData.Rows && apAgingData.Rows.Row) {
            const summaryRow = apAgingData.Rows.Row.find(r =>
                r.id === 'TOTAL' ||
                (r.Summary && r.Summary.ColData &&
                    (r.Summary.ColData[0].value?.toLowerCase() === 'total' || r.Summary.ColData[0].value?.toLowerCase().includes('total')))
            );

            if (summaryRow?.Summary?.ColData) {
                const cols = summaryRow.Summary.ColData;
                const columns = apAgingData.Columns?.Column || [];
                const findColIdx = (text) => columns.findIndex(c => c.ColTitle?.toLowerCase().includes(text.toLowerCase()));

                const currentIdx = findColIdx("current");
                const totalIdx = findColIdx("total") !== -1 ? findColIdx("total") : cols.length - 1;

                const totalAmt = parseFloat(cols[totalIdx]?.value || 0);
                const currentAmt = currentIdx !== -1 ? parseFloat(cols[currentIdx]?.value || 0) : 0;

                vendorStatus.unpaidAmount = totalAmt;
                vendorStatus.notDueYetAmount = currentAmt;
                vendorStatus.overdueAmount = totalAmt - currentAmt;
            }
        }
        (data.recentBillPayments?.QueryResponse?.BillPayment || []).forEach(p => { vendorStatus.paidAmount += parseFloat(p.TotalAmt || 0); });
        (data.recentPurchases?.QueryResponse?.Purchase || []).forEach(p => { vendorStatus.paidAmount += parseFloat(p.TotalAmt || 0); });

        res.json({
            profitAndLoss: pnlData,
            salesReport: salesReportData,
            cashFlow: cashFlowData,
            accounts: mergedAccounts,
            balanceSheet: data.balanceSheet,
            reviewTransactions: reviewTransactionsData,
            invoiceStatus: invoiceStatus,
            customerStatus: invoiceStatus,
            vendorStatus: vendorStatus,
            arAging: arAgingData,
            apAging: apAgingData,
            arAgingDetail: data.arAgingDetail,
            apAgingDetail: data.apAgingDetail,
            companyInfo: data.companyInfo?.CompanyInfo,
            allAccounts: data.allAccounts?.QueryResponse?.Account || [],
            lastUpdated: new Date()
        });
    } catch (error) {
        console.error('Error fetching QuickBooks data:', error);
        res.status(500).json({ message: 'Error fetching QuickBooks data', error: error.message });
    }
});

// 4f. Granular Dashboard Endpoints
app.get('/api/quickbooks/dashboard/customer-status/:userId', async (req, res) => {
    try {
        const { client, user } = await getQuickBooksClient(req.params.userId);
        const realmId = user.qbRealmId;
        const baseUrl = client.environment === 'sandbox'
            ? 'https://sandbox-quickbooks.api.intuit.com'
            : 'https://quickbooks.api.intuit.com';

        const today = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];
        const end = formatDate(today);
        const start = formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

        const [arAging, recentPayments, recentSalesReceipts, allAccounts] = await Promise.all([
            client.makeApiCall({ url: `${baseUrl}/v3/company/${realmId}/reports/AgedReceivableSummary?past_due_only=false`, method: 'GET' }),
            client.makeApiCall({ url: `${baseUrl}/v3/company/${realmId}/query?query=select * from Payment where TxnDate >= '${start}'`, method: 'GET' }),
            client.makeApiCall({ url: `${baseUrl}/v3/company/${realmId}/query?query=select * from SalesReceipt where TxnDate >= '${start}'`, method: 'GET' }),
            client.makeApiCall({ url: `${baseUrl}/v3/company/${realmId}/query?query=select * from Account`, method: 'GET' })
        ]);

        const arAgingData = arAging.json;
        const undepositedAccounts = (allAccounts.json?.QueryResponse?.Account || []).filter(a =>
            a.AccountSubType === 'UndepositedFunds' || a.Name.includes('Undeposited') || a.Name.includes('Payments to deposit')
        );
        const undepositedAccountIds = undepositedAccounts.map(a => a.Id);

        const status = { unpaidAmount: 0, overdueAmount: 0, notDueYetAmount: 0, paidAmount: 0, depositedAmount: 0, notDepositedAmount: 0 };

        if (arAgingData && arAgingData.Rows && arAgingData.Rows.Row) {
            // Find TOTAL row (more robust)
            const summaryRow = arAgingData.Rows.Row.find(r =>
                r.id === 'TOTAL' ||
                (r.Summary && r.Summary.ColData &&
                    (r.Summary.ColData[0].value?.toLowerCase() === 'total' || r.Summary.ColData[0].value?.toLowerCase().includes('total')))
            );

            if (summaryRow?.Summary?.ColData) {
                const cols = summaryRow.Summary.ColData;
                const columns = arAgingData.Columns?.Column || [];

                const findColIdx = (text) => columns.findIndex(c =>
                    c.ColTitle?.toLowerCase().includes(text.toLowerCase())
                );

                const currentIdx = findColIdx("current");
                const totalIdx = findColIdx("total") !== -1 ? findColIdx("total") : cols.length - 1;

                const totalAmt = parseFloat(cols[totalIdx]?.value || 0);
                const currentAmt = currentIdx !== -1 ? parseFloat(cols[currentIdx]?.value || 0) : 0;

                status.unpaidAmount = totalAmt;
                status.notDueYetAmount = currentAmt;
                status.overdueAmount = totalAmt - currentAmt;
            }
        }

        const processPaidItem = (item) => {
            const amount = parseFloat(item.TotalAmt || 0);
            status.paidAmount += amount;
            if (undepositedAccountIds.includes(item.DepositToAccountRef?.value)) status.notDepositedAmount += amount;
            else status.depositedAmount += amount;
        };
        (recentPayments.json?.QueryResponse?.Payment || []).forEach(processPaidItem);
        (recentSalesReceipts.json?.QueryResponse?.SalesReceipt || []).forEach(processPaidItem);

        res.json(status);
    } catch (error) {
        console.error('Error fetching customer status:', error);
        res.status(500).json({ message: 'Error fetching customer status', error: error.message });
    }
});

app.get('/api/quickbooks/dashboard/vendor-status/:userId', async (req, res) => {
    try {
        const { client, user } = await getQuickBooksClient(req.params.userId);
        const realmId = user.qbRealmId;
        const baseUrl = client.environment === 'sandbox'
            ? 'https://sandbox-quickbooks.api.intuit.com'
            : 'https://quickbooks.api.intuit.com';

        const today = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];
        const end = formatDate(today);
        const start = formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

        const [apAging, recentBillPayments, recentPurchases] = await Promise.all([
            client.makeApiCall({ url: `${baseUrl}/v3/company/${realmId}/reports/AgedPayableSummary?past_due_only=false`, method: 'GET' }),
            client.makeApiCall({ url: `${baseUrl}/v3/company/${realmId}/query?query=select * from BillPayment where TxnDate >= '${start}'`, method: 'GET' }),
            client.makeApiCall({ url: `${baseUrl}/v3/company/${realmId}/query?query=select * from Purchase where TxnDate >= '${start}'`, method: 'GET' })
        ]);

        const status = { unpaidAmount: 0, overdueAmount: 0, notDueYetAmount: 0, paidAmount: 0 };
        const apAgingData = apAging.json;

        if (apAgingData && apAgingData.Rows && apAgingData.Rows.Row) {
            // Find TOTAL row (more robust)
            const summaryRow = apAgingData.Rows.Row.find(r =>
                r.id === 'TOTAL' ||
                (r.Summary && r.Summary.ColData &&
                    (r.Summary.ColData[0].value?.toLowerCase() === 'total' || r.Summary.ColData[0].value?.toLowerCase().includes('total')))
            );

            if (summaryRow?.Summary?.ColData) {
                const cols = summaryRow.Summary.ColData;
                const columns = apAgingData.Columns?.Column || [];

                const findColIdx = (text) => columns.findIndex(c =>
                    c.ColTitle?.toLowerCase().includes(text.toLowerCase())
                );

                const currentIdx = findColIdx("current");
                const totalIdx = findColIdx("total") !== -1 ? findColIdx("total") : cols.length - 1;

                const totalAmt = parseFloat(cols[totalIdx]?.value || 0);
                const currentAmt = currentIdx !== -1 ? parseFloat(cols[currentIdx]?.value || 0) : 0;

                status.unpaidAmount = totalAmt;
                status.notDueYetAmount = currentAmt;
                status.overdueAmount = totalAmt - currentAmt;
            }
        }
        (recentBillPayments.json?.QueryResponse?.BillPayment || []).forEach(p => { status.paidAmount += parseFloat(p.TotalAmt || 0); });
        (recentPurchases.json?.QueryResponse?.Purchase || []).forEach(p => { status.paidAmount += parseFloat(p.TotalAmt || 0); });

        res.json(status);
    } catch (error) {
        console.error('Error fetching vendor status:', error);
        res.status(500).json({ message: 'Error fetching vendor status', error: error.message });
    }
});

// 4g. Individual Account Detail
app.get('/api/quickbooks/account/:userId/:accountId', async (req, res) => {
    try {
        const { userId, accountId } = req.params;
        const { client, user } = await getQuickBooksClient(userId);

        const realmId = user.qbRealmId;
        const baseUrl = client.environment === 'sandbox'
            ? 'https://sandbox-quickbooks.api.intuit.com'
            : 'https://quickbooks.api.intuit.com';

        const response = await client.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/account/${accountId}?minorversion=75`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(response.json);
    } catch (error) {
        console.error('Error fetching account detail:', error);
        res.status(500).json({ message: 'Error fetching account detail', error: error.message });
    }
});

// 4h. Customers List API
app.get('/api/quickbooks/customers/:userId', async (req, res) => {
    try {
        const { client, user } = await getQuickBooksClient(req.params.userId);
        const realmId = user.qbRealmId;
        const baseUrl = client.environment === 'sandbox'
            ? 'https://sandbox-quickbooks.api.intuit.com'
            : 'https://quickbooks.api.intuit.com';

        const url = `${baseUrl}/v3/company/${realmId}/query?query=select * from Customer&minorversion=75`;

        console.log(`Fetching customers for user ${user.email}`);
        const response = await client.makeApiCall({
            url,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(response.json?.QueryResponse?.Customer || []);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
});

// 4i. Vendors List API
app.get('/api/quickbooks/vendors/:userId', async (req, res) => {
    try {
        const { client, user } = await getQuickBooksClient(req.params.userId);
        const realmId = user.qbRealmId;
        const baseUrl = client.environment === 'sandbox'
            ? 'https://sandbox-quickbooks.api.intuit.com'
            : 'https://quickbooks.api.intuit.com';

        const url = `${baseUrl}/v3/company/${realmId}/query?query=select * from Vendor&minorversion=75`;

        console.log(`Fetching vendors for user ${user.email}`);
        const response = await client.makeApiCall({
            url,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(response.json?.QueryResponse?.Vendor || []);
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ message: 'Error fetching vendors', error: error.message });
    }
});

// 4g. Company Info
app.get('/api/quickbooks/company-info/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { client, user } = await getQuickBooksClient(userId);

        const realmId = user.qbRealmId;
        const baseUrl = client.environment === 'sandbox'
            ? 'https://sandbox-quickbooks.api.intuit.com'
            : 'https://quickbooks.api.intuit.com';

        const url = `${baseUrl}/v3/company/${realmId}/companyinfo/${realmId}?minorversion=75`;
        console.log(`Fetching company info for user ${user.email} (Realm: ${realmId})`);

        const response = await client.makeApiCall({
            url,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response || !response.json) {
            console.error('Empty response or missing JSON from QuickBooks API for company info');
            return res.status(500).json({ message: 'Empty response from QuickBooks' });
        }

        const companyInfo = response.json.CompanyInfo;
        if (!companyInfo) {
            console.warn(`CompanyInfo object missing in response for user ${user.email}`);
            return res.json({}); // Return empty object instead of potentially null/undefined
        }

        res.json(companyInfo);
    } catch (error) {
        console.error('Error fetching company info:', error);
        res.status(500).json({ message: 'Error fetching company info', error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
