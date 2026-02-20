require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const OAuthClient = require('intuit-oauth');

const User = require('./models/User');
const ClientIntake = require('./models/ClientIntake');
const Report = require('./models/Report');
const Shortcut = require('./models/Shortcut');
const Contact = require('./models/Contact');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Initialize QuickBooks OAuth client
const oauthClient = new OAuthClient({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    environment: process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox', // Use 'sandbox' or 'production'
    redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || 'http://localhost:5000/api/quickbooks/callback'
});

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
        const shortcuts = await Shortcut.find({ userId }).sort({ groupName: 1 });
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

// 2. Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ email, password });
        await user.save();

        res.status(201).json({ message: 'User created successfully', user: { email: user.email, id: user._id } });
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

        res.json({ message: 'Login successful', user: { email: user.email, id: user._id } });
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

// 4. QuickBooks OAuth Routes

// 4a. Authentication Route
app.get('/api/quickbooks/auth', (req, res) => {
    const { userId } = req.query;
    const authUri = oauthClient.authorizeUri({
        scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
        state: userId || 'testState',
    });
    res.json({ authUri });
});

// 4b. Callback Route
app.get('/api/quickbooks/callback', async (req, res) => {
    try {
        const authResponse = await oauthClient.createToken(req.url);
        const { access_token, refresh_token, expires_in, x_refresh_token_expires_in } = authResponse.token;
        const realmId = req.query.realmId;

        // Get userId from state
        const userId = req.query.state;

        // Update user in DB
        // If we don't have a userId, we might need a different way to associate.
        // For this task, let's assume the frontend sends the userId in the 'state' parameter.

        if (userId) {
            await User.findByIdAndUpdate(userId, {
                qbAccessToken: access_token,
                qbRefreshToken: refresh_token,
                qbRealmId: realmId,
                qbTokenExpiry: new Date(Date.now() + expires_in * 1000),
                qbConnected: true
            });
        }

        // Redirect back to frontend
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        res.redirect(`${frontendUrl}/dashboard?status=success`);
    } catch (error) {
        console.error('QuickBooks Callback Error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
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

// 4d. Business Overview Data
app.get('/api/quickbooks/business-overview/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user || !user.qbConnected) {
            return res.status(404).json({ message: 'User not connected to QuickBooks' });
        }

        // Setup oauthClient with user tokens
        oauthClient.setToken({
            access_token: user.qbAccessToken,
            refresh_token: user.qbRefreshToken,
            realmId: user.qbRealmId,
            expires_in: Math.floor((new Date(user.qbTokenExpiry) - Date.now()) / 1000),
            x_refresh_token_expires_in: 0 // Not strictly needed for refresh check
        });

        // Refresh token if expired
        if (!oauthClient.isAccessTokenValid()) {
            try {
                console.log('Refreshing QuickBooks token...');
                const authResponse = await oauthClient.refresh();
                const { access_token, refresh_token, expires_in } = authResponse.token;

                user.qbAccessToken = access_token;
                user.qbRefreshToken = refresh_token;
                user.qbTokenExpiry = new Date(Date.now() + expires_in * 1000);
                await user.save();
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                if (refreshError.message?.includes('Refresh token is invalid')) {
                    user.qbConnected = false;
                    await user.save();
                    return res.status(401).json({
                        message: 'QuickBooks authorization expired',
                        error: 'The Refresh token is invalid, please Authorize again.'
                    });
                }
                throw refreshError;
            }
        }

        const realmId = user.qbRealmId;
        const baseUrl = oauthClient.environment === 'sandbox'
            ? 'https://sandbox-quickbooks.api.intuit.com'
            : 'https://quickbooks.api.intuit.com';

        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const formatDate = (date) => date.toISOString().split('T')[0];
        const start = formatDate(thirtyDaysAgo);
        const end = formatDate(today);

        const todayFormatted = end;
        const thirtyDaysAgoFormatted = start;
        const oneYearAgoFormatted = formatDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));

        // 1. Fetch Profit and Loss (Last 30 Days) - Dashboard often uses this Month, but keeping 30 days for now or matching start/end
        const pnLResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/reports/ProfitAndLoss?start_date=${start}&end_date=${end}&summarize_column_by=Month`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const pnlData = pnLResponse.json;

        // 1b. Fetch Sales (Year to Date) - Specifically for the Sales Card
        const currentYearStart = formatDate(new Date(today.getFullYear(), 0, 1));
        const salesReportResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/reports/ProfitAndLoss?start_date=${currentYearStart}&end_date=${todayFormatted}&summarize_column_by=Month`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const salesReportData = salesReportResponse.json;


        // 2. Fetch Cash Flow (Last 30 Days) - Dashboard uses CASH BASIS
        const cashFlowResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/reports/CashFlow?start_date=${start}&end_date=${end}&accounting_method=Cash`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const cashFlowData = cashFlowResponse.json;

        // 3. Fetch Bank Accounts (using a query)
        const accountsResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/query?query=select * from Account where AccountType in ('Bank', 'Credit Card')`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const ledgerAccounts = accountsResponse.json?.QueryResponse?.Account || [];


        // 3b. Fetch Banking Feed Data (Live Feed) - Try/Catch required as not all companies have this enabled
        let bankingAccounts = [];
        try {
            console.log('Fetching QuickBooks Banking Feed...');
            const bankingResponse = await oauthClient.makeApiCall({
                url: `${baseUrl}/v3/company/${realmId}/banking/accounts?minorversion=75`,
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            bankingAccounts = bankingResponse.json?.accounts || [];
            console.log(`QuickBooks Banking Feed Result: ${bankingAccounts.length} accounts found.`);
        } catch (bankingErr) {
            console.warn('QuickBooks Banking feed not available or failed:', bankingErr.message);

        }

        // MOVED FETCH: reviewTransactionsData needs to be available for the fallback logic below
        const reviewTransactionsResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/reports/TransactionList?txn_status=ForReview&start_date=${start}&end_date=${end}`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const reviewTransactionsData = reviewTransactionsResponse.json;

        // Merge Accounting + Banking
        const bankingMap = {};
        bankingAccounts.forEach(acc => {
            bankingMap[acc.qboAccountId] = acc;
        });

        // 3c. Fallback: Parse TransactionList report for "to review" counts if Banking Feed is empty
        const reportToReviewCounts = {};
        if (bankingAccounts.length === 0 && reviewTransactionsData && reviewTransactionsData.Rows && reviewTransactionsData.Rows.Row) {
            console.log('Banking feed empty, parsing TransactionList for review counts...');
            // Find "Account" column index
            const accountColIndex = reviewTransactionsData.Columns?.Column?.findIndex(c => c.ColTitle === 'Account' || c.ColType === 'Account') ?? -1;

            if (accountColIndex !== -1) {
                const rows = reviewTransactionsData.Rows.Row;
                rows.forEach(row => {
                    if (row.ColData && row.ColData[accountColIndex]) {
                        const accountName = row.ColData[accountColIndex].value;
                        if (accountName) {
                            reportToReviewCounts[accountName] = (reportToReviewCounts[accountName] || 0) + 1;
                        }
                    }
                });
            }
            console.log('Counts found via report fallback:', reportToReviewCounts);
        }

        const mergedAccounts = ledgerAccounts.map(acc => {
            const feed = bankingMap[acc.Id];
            // Use feed count or report count fallback
            const unmatchedCount = (feed && feed.unmatchedCount !== undefined)
                ? feed.unmatchedCount
                : (reportToReviewCounts[acc.Name] || 0);

            return {
                ...acc,
                // Unified fields for frontend
                bankBalance: (feed && feed.bankBalance !== undefined) ? feed.bankBalance : (acc.BankBalance || acc.CurrentBalance || 0),
                qboBalance: acc.CurrentBalance || 0,
                unmatchedCount: unmatchedCount,
                fiName: feed ? feed.fiName : null,
                connectionType: feed ? feed.connectionType : "DISCONNECTED",
                lastUpdateTime: feed ? feed.lastUpdateTime : null
            };
        });

        // 4. Fetch BalanceSheet (Today's snapshot, CASH basis for bank widget alignment)
        const balanceSheetResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/reports/BalanceSheet?accounting_method=Cash&as_of_date=${todayFormatted}`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const balanceSheetData = balanceSheetResponse.json;

        // 5. Fetch Aged Receivable Summary (The source of truth for dashboard Unpaid/Overdue)
        const arAgingResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/reports/AgedReceivableSummary?past_due_only=false`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const arAgingData = arAgingResponse.json;

        // 6. Fetch Aged Payable Summary
        const apAgingResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/reports/AgedPayableSummary?past_due_only=false`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const apAgingData = apAgingResponse.json;

        // 6b. Fetch Aged Payable Detail (Added as requested)
        const apAgingDetailResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/reports/AgedPayableDetail?past_due_only=false`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const apAgingDetailData = apAgingDetailResponse.json;

        // 6c. Fetch Aged Receivable Detail (Symmetric addition)
        const arAgingDetailResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/reports/AgedReceivableDetail?past_due_only=false`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const arAgingDetailData = arAgingDetailResponse.json;

        // 7. Fetch Invoices for status (Unpaid part) - Keeping for reference, but using Aging report for totals
        const invoicesResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/query?query=select * from Invoice where Balance > '0' AND TxnDate >= '${oneYearAgoFormatted}'`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const unpaidInvoices = invoicesResponse.json?.QueryResponse?.Invoice || [];

        // 8. Fetch Payments and SalesReceipts for status (Paid part)
        const paymentsResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/query?query=select * from Payment where TxnDate >= '${thirtyDaysAgoFormatted}'`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const recentPayments = paymentsResponse.json?.QueryResponse?.Payment || [];

        const salesReceiptsResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/query?query=select * from SalesReceipt where TxnDate >= '${thirtyDaysAgoFormatted}'`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const recentSalesReceipts = salesReceiptsResponse.json?.QueryResponse?.SalesReceipt || [];

        const undepositedAccountsResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/query?query=select * from Account`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const allAccounts = undepositedAccountsResponse.json?.QueryResponse?.Account || [];
        const undepositedAccounts = allAccounts.filter(a =>
            a.AccountSubType === 'UndepositedFunds' ||
            a.Name === 'Undeposited Funds' ||
            a.Name === 'Payments to deposit' ||
            (a.AccountType === 'Other Current Asset' && a.Name.includes('Undeposited'))
        );

        const undepositedAccountIds = undepositedAccounts.map(a => a.Id);

        const invoiceStatus = {
            unpaidAmount: 0,
            overdueAmount: 0,
            notDueYetAmount: 0,
            paidAmount: 0,
            depositedAmount: 0,
            notDepositedAmount: 0
        };

        // Process Unpaid from Aging Report (Single source of truth for dashboard)
        if (arAgingData && arAgingData.Rows && arAgingData.Rows.Row) {
            // Find Summary Row (Total)
            const summaryRow = arAgingData.Rows.Row.find(r => r.id === 'TOTAL' || (r.Summary && r.Summary.ColData && r.Summary.ColData[0].value === 'Total'));
            if (summaryRow && summaryRow.Summary && summaryRow.Summary.ColData) {
                const cols = summaryRow.Summary.ColData;
                // Cols: [Name, Current, 1-30, 31-60, 61-90, 91 and over, Total]
                if (cols.length >= 7) {
                    const currentAmt = parseFloat(cols[1].value || 0);
                    const totalAmt = parseFloat(cols[cols.length - 1].value || 0);
                    const overdueAmt = totalAmt - currentAmt;

                    invoiceStatus.unpaidAmount = totalAmt;
                    invoiceStatus.notDueYetAmount = currentAmt;
                    invoiceStatus.overdueAmount = overdueAmt;
                }
            }
        }

        // Fallback to manual if aging report failed or returned zero (unexpected)
        if (invoiceStatus.unpaidAmount === 0 && unpaidInvoices.length > 0) {
            unpaidInvoices.forEach(inv => {
                const balance = parseFloat(inv.Balance || 0);
                const dueDate = inv.DueDate;
                invoiceStatus.unpaidAmount += balance;
                if (dueDate && dueDate < todayFormatted) {
                    invoiceStatus.overdueAmount += balance;
                } else {
                    invoiceStatus.notDueYetAmount += balance;
                }
            });
        }

        const processPaidItem = (item) => {
            const amount = parseFloat(item.TotalAmt || 0);
            invoiceStatus.paidAmount += amount;

            const depositTo = item.DepositToAccountRef?.value;
            // If it goes to an undeposited funds account, it's not deposited
            if (undepositedAccountIds.includes(depositTo)) {
                invoiceStatus.notDepositedAmount += amount;
            } else {
                // If it goes directly to a bank account or any other account, consider it deposited
                invoiceStatus.depositedAmount += amount;
            }
        };

        recentPayments.forEach(processPaidItem);
        recentSalesReceipts.forEach(processPaidItem);


        const billPaymentsResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/query?query=select * from BillPayment where TxnDate >= '${thirtyDaysAgoFormatted}'`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const recentBillPayments = billPaymentsResponse.json?.QueryResponse?.BillPayment || [];

        const vendorPurchasesResponse = await oauthClient.makeApiCall({
            url: `${baseUrl}/v3/company/${realmId}/query?query=select * from Purchase where TxnDate >= '${thirtyDaysAgoFormatted}'`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const recentPurchases = vendorPurchasesResponse.json?.QueryResponse?.Purchase || [];

        const vendorStatus = {
            unpaidAmount: 0,
            overdueAmount: 0,
            notDueYetAmount: 0,
            paidAmount: 0
        };

        // Process Unpaid from AP Aging Report
        if (apAgingData && apAgingData.Rows && apAgingData.Rows.Row) {
            const summaryRow = apAgingData.Rows.Row.find(r => r.id === 'TOTAL' || (r.Summary && r.Summary.ColData && r.Summary.ColData[0].value === 'Total'));
            if (summaryRow && summaryRow.Summary && summaryRow.Summary.ColData) {
                const cols = summaryRow.Summary.ColData;
                if (cols.length >= 7) {
                    const currentAmt = parseFloat(cols[1].value || 0);
                    const totalAmt = parseFloat(cols[cols.length - 1].value || 0);
                    const overdueAmt = totalAmt - currentAmt;

                    vendorStatus.unpaidAmount = totalAmt;
                    vendorStatus.notDueYetAmount = currentAmt;
                    vendorStatus.overdueAmount = overdueAmt;
                }
            }
        }

        recentBillPayments.forEach(p => {
            vendorStatus.paidAmount += parseFloat(p.TotalAmt || 0);
        });
        recentPurchases.forEach(p => {
            // Purchases are often direct payments
            vendorStatus.paidAmount += parseFloat(p.TotalAmt || 0);
        });

        console.log('Bill Status Calculation Summary:', {
            billPaymentsCount: recentBillPayments.length,
            purchasesCount: recentPurchases.length,
            finalStatus: vendorStatus
        });


        res.json({
            profitAndLoss: pnlData,
            salesReport: salesReportData,
            cashFlow: cashFlowData,

            accounts: mergedAccounts,
            balanceSheet: balanceSheetData,
            reviewTransactions: reviewTransactionsData,
            invoiceStatus: invoiceStatus,
            customerStatus: invoiceStatus,
            vendorStatus: vendorStatus,
            arAging: arAgingData,

            apAging: apAgingData,
            arAgingDetail: arAgingDetailData,
            apAgingDetail: apAgingDetailData,
            lastUpdated: new Date()
        });
    } catch (error) {
        console.error('Error fetching QuickBooks data:', error);
        res.status(500).json({ message: 'Error fetching QuickBooks data', error: error.message });
    }
});

// 4e. Individual Account Detail
app.get('/api/quickbooks/account/:userId/:accountId', async (req, res) => {
    try {
        const { userId, accountId } = req.params;
        const user = await User.findById(userId);
        if (!user || !user.qbConnected) {
            return res.status(404).json({ message: 'User not connected to QuickBooks' });
        }

        // Setup oauthClient
        oauthClient.setToken({
            access_token: user.qbAccessToken,
            refresh_token: user.qbRefreshToken,
            realmId: user.qbRealmId,
            expires_in: Math.floor((new Date(user.qbTokenExpiry) - Date.now()) / 1000)
        });

        // Refresh token if needed
        if (!oauthClient.isAccessTokenValid()) {
            try {
                const authResponse = await oauthClient.refresh();
                const { access_token, refresh_token, expires_in } = authResponse.token;
                user.qbAccessToken = access_token;
                user.qbRefreshToken = refresh_token;
                user.qbTokenExpiry = new Date(Date.now() + expires_in * 1000);
                await user.save();
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                return res.status(401).json({ message: 'QuickBooks authorization expired' });
            }
        }

        const realmId = user.qbRealmId;
        const baseUrl = oauthClient.environment === 'sandbox'
            ? 'https://sandbox-quickbooks.api.intuit.com'
            : 'https://quickbooks.api.intuit.com';

        const response = await oauthClient.makeApiCall({
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
