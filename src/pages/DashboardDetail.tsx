import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Wallet, Receipt, TrendingUp, CreditCard, PieChart, Loader2, Building2 } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart as RePieChart,
    Pie,
    Legend
} from "recharts";
import { API_ENDPOINTS } from "@/lib/config";
import { QuickBooksReportDetail } from "@/components/dashboard/QuickBooksReportDetail";
import { CompanyProfileCard } from "@/components/dashboard/CompanyProfileCard";

const DashboardDetail = () => {
    const { type } = useParams<{ type: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [qbData, setQbData] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [summaryInfo, setSummaryInfo] = useState({ total: 0, trend: 0, insightLabel: "", insightValue: "" });

    const parseAmount = (val: any) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const clean = String(val).replace(/[^0-9.-]+/g, "");
        return parseFloat(clean) || 0;
    };

    useEffect(() => {
        const fetchData = async () => {
            const userStr = localStorage.getItem('qb_user');
            if (!userStr) { navigate("/login"); return; }
            const user = JSON.parse(userStr);

            try {
                let url = "";
                const today = new Date().toISOString().split('T')[0];
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

                if (type === 'bank-accounts') {
                    url = `${API_ENDPOINTS.QUICKBOOKS.ACCOUNTS}/${user.id}`;
                } else if (type === 'customers') {
                    url = `${API_ENDPOINTS.QUICKBOOKS.CUSTOMERS}/${user.id}`;
                } else if (type === 'vendors') {
                    url = `${API_ENDPOINTS.QUICKBOOKS.VENDORS}/${user.id}`;
                } else if (type === 'profit-loss' || type === 'expenses') {
                    url = `${API_ENDPOINTS.QUICKBOOKS.REPORTS}/ProfitAndLoss/${user.id}?summarize_column_by=Month&start_date=${thirtyDaysAgo}&end_date=${today}`;
                } else if (type === 'sales') {
                    url = `${API_ENDPOINTS.QUICKBOOKS.REPORTS}/ProfitAndLoss/${user.id}?summarize_column_by=Month&start_date=${yearStart}&end_date=${today}`;
                } else if (type === 'cash-flow') {
                    url = `${API_ENDPOINTS.QUICKBOOKS.REPORTS}/CashFlow/${user.id}?start_date=${thirtyDaysAgo}&end_date=${today}&accounting_method=Cash`;
                } else if (type === 'invoices') {
                    url = `${API_ENDPOINTS.QUICKBOOKS.REPORTS}/AgedReceivableSummary/${user.id}`;
                } else if (type === 'vendors') {
                    url = `${API_ENDPOINTS.QUICKBOOKS.REPORTS}/AgedPayableSummary/${user.id}`;
                } else if (type === 'accounts') {
                    url = `${API_ENDPOINTS.QUICKBOOKS.OVERVIEW}/${user.id}`;
                }

                if (url) {
                    const res = await fetch(url);
                    if (res.ok) {
                        const data = await res.json();

                        // Adapt data structure to match what processReportData expects
                        // or modify processReportData to handle raw report data
                        const adaptedData: any = {};
                        if (type === 'bank-accounts') {
                            adaptedData.accounts = data;
                        } else if (type === 'customers') {
                            adaptedData.customersList = data;
                        } else if (type === 'vendors') {
                            adaptedData.vendorsList = data;
                        } else if (type === 'profit-loss' || type === 'expenses') {
                            adaptedData.profitAndLoss = data;
                        } else if (type === 'sales') {
                            adaptedData.salesReport = data;
                        } else if (type === 'cash-flow') {
                            adaptedData.cashFlow = data;
                        } else if (type === 'invoices') {
                            adaptedData.arAging = data;
                        } else if (type === 'vendors') {
                            adaptedData.apAging = data;
                        } else if (type === 'accounts') {
                            Object.assign(adaptedData, data);
                        }

                        adaptedData.lastUpdated = new Date();
                        setQbData(adaptedData);
                        processReportData(adaptedData, type);
                    }
                }
            } catch (error) {
                console.error("Error fetching detail data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type, navigate]);

    const processReportData = (data: any, type: string | undefined) => {
        if (!data) return;

        if (type === 'profit-loss' || type === 'sales') {
            const report = type === 'sales' ? data.salesReport : data.profitAndLoss;
            if (report && report.Rows && report.Rows.Row) {
                const columns = report.Columns.Column;
                const rows = report.Rows.Row;

                // Extract monthly data
                const monthlyData: any[] = [];
                const months = columns.filter((c: any) => c.ColTitle !== "Total" && c.ColTitle !== "");

                months.forEach((col: any, idx: number) => {
                    const monthIdx = columns.indexOf(col);
                    let incomeVal = 0;
                    let expenseVal = 0;

                    // Find Income and Expense rows
                    const incomeRow = rows.find((r: any) => r.group === "Income" || (r.Header && r.Header.ColData && r.Header.ColData[0].value === "Income"));
                    const expenseRow = rows.find((r: any) => r.group === "Expense" || r.group === "Expenses" || (r.Header && r.Header.ColData && r.Header.ColData[0].value === "Expenses"));

                    if (incomeRow) incomeVal = parseFloat(incomeRow.Summary?.ColData[monthIdx]?.value || 0);
                    if (expenseRow) expenseVal = parseFloat(expenseRow.Summary?.ColData[monthIdx]?.value || 0);

                    monthlyData.push({
                        name: col.ColTitle,
                        income: incomeVal,
                        expenses: expenseVal,
                        net: incomeVal - expenseVal,
                        value: type === 'sales' ? incomeVal : (incomeVal - expenseVal)
                    });
                });

                setChartData(monthlyData);

                // Set summary
                const lastMonth = monthlyData[monthlyData.length - 1];
                const prevMonth = monthlyData[monthlyData.length - 2];
                const trend = prevMonth && prevMonth.value !== 0 ? ((lastMonth.value - prevMonth.value) / Math.abs(prevMonth.value)) * 100 : 0;

                setSummaryInfo({
                    total: lastMonth?.value || 0,
                    trend: Math.round(trend * 10) / 10,
                    insightLabel: "Top Category",
                    insightValue: "Professional Services" // Mocking for now as parsing deep rows is complex
                });
            }
        } else if (type === 'expenses') {
            const report = data.profitAndLoss;
            if (report && report.Rows && report.Rows.Row) {
                const rows = report.Rows.Row;
                const expenseRow = rows.find((r: any) => r.group === "Expense" || r.group === "Expenses" || (r.Header && r.Header.ColData && r.Header.ColData[0].value === "Expenses"));

                if (expenseRow && expenseRow.Rows && expenseRow.Rows.Row) {
                    const categories = expenseRow.Rows.Row.map((r: any, idx: number) => ({
                        name: r.Header?.ColData[0]?.value || r.ColData[0]?.value || "Other",
                        value: Math.abs(parseFloat(r.Summary?.ColData[r.Summary.ColData.length - 1]?.value || r.ColData[r.ColData.length - 1]?.value || 0)),
                        color: [`#00a1b1`, `#00727c`, `#bfe1e5`, `#2ca01c`, `#ff8a00`, `#ef4444`, `#8b5cf6`][idx % 7]
                    })).filter((c: any) => c.value > 0).sort((a: any, b: any) => b.value - a.value).slice(0, 5);

                    setChartData(categories);
                    const totalExpenses = categories.reduce((sum: number, c: any) => sum + c.value, 0);
                    setSummaryInfo({
                        total: totalExpenses,
                        trend: 0,
                        insightLabel: "Major Expense",
                        insightValue: categories[0]?.name || "N/A"
                    });
                }
            }
        } else if (type === 'cash-flow') {
            const report = data.cashFlow;
            if (report && report.Rows && report.Rows.Row) {
                const rows = report.Rows.Row;
                const activitiesData: any[] = [];
                let netIncrease = 0;

                const findSectionValue = (sectionName: string) => {
                    const section = rows.find((r: any) =>
                        r.Header?.ColData?.[0]?.value?.toLowerCase().includes(sectionName.toLowerCase()) ||
                        r.Summary?.ColData?.[0]?.value?.toLowerCase().includes(sectionName.toLowerCase())
                    );
                    if (section && section.Summary && section.Summary.ColData) {
                        return parseAmount(section.Summary.ColData[section.Summary.ColData.length - 1]?.value);
                    }
                    return 0;
                };

                const operating = findSectionValue("Operating Activities");
                const investing = findSectionValue("Investing Activities");
                const financing = findSectionValue("Financing Activities");

                activitiesData.push({ name: "Operating", value: operating, color: "#2ca01c" });
                activitiesData.push({ name: "Investing", value: investing, color: "#00a1b1" });
                activitiesData.push({ name: "Financing", value: financing, color: "#ff8a00" });

                // Find Net Increase/Decrease
                const netRow = rows.find((r: any) =>
                    r.Summary?.ColData?.[0]?.value?.toLowerCase().includes("net increase") ||
                    r.Summary?.ColData?.[0]?.value?.toLowerCase().includes("net decrease") ||
                    r.ColData?.[0]?.value?.toLowerCase().includes("net increase")
                );

                if (netRow) {
                    netIncrease = parseAmount(netRow.Summary?.ColData?.[netRow.Summary.ColData.length - 1]?.value || netRow.ColData?.[netRow.ColData.length - 1]?.value);
                } else {
                    netIncrease = operating + investing + financing;
                }

                setChartData(activitiesData);
                setSummaryInfo({
                    total: netIncrease,
                    trend: 0,
                    insightLabel: "Net Cash Increase",
                    insightValue: `$${netIncrease.toLocaleString()}`
                });
            }
        } else if (type === 'accounts') {
            const allAccounts = data.allAccounts || data.accounts || [];

            // Calculate Asset vs Liability breakdown
            const assets = allAccounts.filter((a: any) =>
                ['Bank', 'Other Current Asset', 'Fixed Asset', 'Accounts Receivable', 'Asset', 'Other Asset'].includes(a.AccountType)
            );
            const liabilities = allAccounts.filter((a: any) =>
                ['Credit Card', 'Other Current Liability', 'Long Term Liability', 'Accounts Payable', 'Liability'].includes(a.AccountType)
            );

            const totalAssets = assets.reduce((sum: number, a: any) => sum + (a.CurrentBalance || a.qboBalance || 0), 0);
            const totalLiabilities = liabilities.reduce((sum: number, a: any) => sum + (a.CurrentBalance || a.qboBalance || 0), 0);

            // Chart data for account type distribution
            const typeCounts: Record<string, number> = {};
            allAccounts.forEach((a: any) => {
                const balance = Math.abs(a.CurrentBalance || a.qboBalance || 0);
                if (balance > 0) {
                    typeCounts[a.AccountType] = (typeCounts[a.AccountType] || 0) + balance;
                }
            });

            const accountBreakdown = Object.entries(typeCounts).map(([name, value], idx) => ({
                name,
                value,
                color: [`#00a1b1`, `#00727c`, `#bfe1e5`, `#2ca01c`, `#ff8a00`, `#ef4444`, `#8b5cf6`][idx % 7]
            })).sort((a, b) => b.value - a.value).slice(0, 5);

            setChartData(accountBreakdown);

            setSummaryInfo({
                total: totalAssets,
                trend: 0,
                insightLabel: "Net Position",
                insightValue: `$${(totalAssets - totalLiabilities).toLocaleString()}`
            });
        } else if (type === 'customers') {
            const customers = data.customersList || [];
            const sortedByBalance = [...customers].sort((a: any, b: any) => (b.Balance || 0) - (a.Balance || 0)).slice(0, 5);

            const chartData = sortedByBalance.map((c: any, idx: number) => ({
                name: c.DisplayName || c.CompanyName || "N/A",
                value: c.Balance || 0,
                color: [`#00a1b1`, `#00727c`, `#bfe1e5`, `#2ca01c`, `#ff8a00`, `#ef4444`, `#8b5cf6`][idx % 7]
            })).filter(d => d.value > 0);

            setChartData(chartData);

            const totalBalance = customers.reduce((sum: number, c: any) => sum + (c.Balance || 0), 0);
            setSummaryInfo({
                total: totalBalance,
                trend: 0,
                insightLabel: "Top Customer",
                insightValue: sortedByBalance[0]?.DisplayName || "N/A"
            });
        } else if (type === 'vendors') {
            const vendors = data.vendorsList || [];
            const sortedByBalance = [...vendors].sort((a: any, b: any) => (b.Balance || 0) - (a.Balance || 0)).slice(0, 5);

            const chartData = sortedByBalance.map((v: any, idx: number) => ({
                name: v.DisplayName || v.CompanyName || "N/A",
                value: v.Balance || 0,
                color: [`#00a1b1`, `#00727c`, `#bfe1e5`, `#2ca01c`, `#ff8a00`, `#ef4444`, `#8b5cf6`][idx % 7]
            })).filter(d => d.value > 0);

            setChartData(chartData);

            const totalBalance = vendors.reduce((sum: number, v: any) => sum + (v.Balance || 0), 0);
            setSummaryInfo({
                total: totalBalance,
                trend: 0,
                insightLabel: "Top Vendor",
                insightValue: sortedByBalance[0]?.DisplayName || "N/A"
            });
        } else if (type === 'invoices') {
            const report = type === 'vendors' ? data.apAging : data.arAging;
            if (report && report.Header && report.Rows && report.Columns) {
                const columns = report.Columns.Column;

                // Find column indices
                const findColIdx = (text: string) => columns.findIndex((c: any) =>
                    c.ColTitle?.toLowerCase().includes(text.toLowerCase())
                );

                const currentIdx = findColIdx("Current");
                const idx1_30 = findColIdx("1 - 30") !== -1 ? findColIdx("1 - 30") : findColIdx("1-30");
                const idx31_60 = findColIdx("31 - 60") !== -1 ? findColIdx("31 - 60") : findColIdx("31-60");
                const idx61_90 = findColIdx("61 - 90") !== -1 ? findColIdx("61 - 90") : findColIdx("61-90");
                const idx91_plus = findColIdx("91 and over") !== -1 ? findColIdx("91 and over") : findColIdx("91+");
                const totalColIdx = findColIdx("Total");

                // Find TOTAL row
                const findSummaryRow = (rows: any[]): any => {
                    for (const row of rows) {
                        if (row.id === 'TOTAL' || (row.Summary && row.Summary.ColData && row.Summary.ColData[0]?.value?.toLowerCase().includes('total'))) {
                            return row;
                        }
                        if (row.Rows && row.Rows.Row) {
                            const found = findSummaryRow(row.Rows.Row);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                const summaryRow = findSummaryRow(report.Rows.Row || []);
                if (summaryRow && summaryRow.Summary && summaryRow.Summary.ColData) {
                    const cols = summaryRow.Summary.ColData;

                    const agingData = [
                        { name: "Current", value: parseAmount(cols[currentIdx]?.value), color: "#43a047" },
                        { name: "1-30 Days", value: parseAmount(cols[idx1_30]?.value), color: "#00acc1" },
                        { name: "31-60 Days", value: parseAmount(cols[idx31_60]?.value), color: "#7e57c2" },
                        { name: "61-90 Days", value: parseAmount(cols[idx61_90]?.value), color: "#1e88e5" },
                        { name: "91+ Days", value: parseAmount(cols[idx91_plus]?.value), color: "#26c6da" }
                    ];
                    setChartData(agingData);

                    const total = parseAmount(cols[totalColIdx]?.value);
                    const currentVal = parseAmount(cols[currentIdx]?.value);
                    setSummaryInfo({
                        total,
                        trend: 0,
                        insightLabel: "Overdue Balance",
                        insightValue: `$${(total - currentVal).toLocaleString()}`
                    });
                }
            }
        } else if (type === 'bank-accounts') {
            const accounts = data.accounts || [];

            // Map accounts to chart data
            const accountData = accounts.map((acc: any, idx: number) => ({
                name: acc.Name,
                value: acc.CurrentBalance || acc.qboBalance || 0,
                color: [`#00a1b1`, `#00727c`, `#bfe1e5`, `#2ca01c`, `#ff8a00`, `#ef4444`, `#8b5cf6`][idx % 7]
            })).filter((a: any) => a.value > 0).sort((a: any, b: any) => b.value - a.value);

            setChartData(accountData);

            // Calculate total and find main account
            const total = accountData.reduce((sum: number, a: any) => sum + a.value, 0);
            const mainAccount = accountData[0]?.name || "N/A";

            setSummaryInfo({
                total,
                trend: 0,
                insightLabel: "Main Account",
                insightValue: mainAccount
            });
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'invoices': return "Invoices Detail";
            case 'customers': return "Customers (AR) Aging";
            case 'vendors': return "Vendors (AP) Aging";
            case 'sales': return "Sales Performance";
            case 'profit-loss': return "Profit and Loss Detail";
            case 'expenses': return "Expenses Breakdown";
            case 'cash-flow': return "Cash Flow Analysis";
            case 'bank-accounts': return "Bank Accounts Overview";
            case 'accounts': return "Account & Company Details";
            default: return "Detail View";
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'invoices':
            case 'customers': return <Receipt className="w-5 h-5" />;
            case 'vendors': return <Building2 className="w-5 h-5" />;
            case 'sales': return <TrendingUp className="w-5 h-5" />;
            case 'profit-loss': return <ArrowUpRight className="w-5 h-5" />;
            case 'expenses': return <ArrowDownLeft className="w-5 h-5" />;
            case 'cash-flow': return <Wallet className="w-5 h-5" />;
            case 'bank-accounts': return <CreditCard className="w-5 h-5" />;
            case 'accounts': return <Building2 className="w-5 h-5" />;
            default: return <PieChart className="w-5 h-5" />;
        }
    };

    const renderChart = () => {
        if (chartData.length === 0 && !loading && type !== 'accounts') {
            return <div className="flex items-center justify-center h-[300px] text-gray-500 italic">No visual data available for this view</div>;
        }

        switch (type) {
            case 'sales':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => `$${Math.round(val / 1000)}k`} />
                            <Tooltip formatter={(value: any) => [`$${parseFloat(value).toLocaleString()}`, 'Sales']} />
                            <Line type="monotone" dataKey="income" stroke="#2ca01c" strokeWidth={3} dot={{ r: 4 }} name="Sales" />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'profit-loss':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => `$${Math.round(val / 1000)}k`} />
                            <Tooltip formatter={(value: any) => `$${parseFloat(value).toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="income" fill="#2ca01c" radius={[4, 4, 0, 0]} name="Income" />
                            <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                            <Bar dataKey="net" fill="#00a1b1" radius={[4, 4, 0, 0]} name="Net Profit" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'bank-accounts':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10 }}
                                width={120}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                formatter={(value: any) => [`$${parseFloat(value).toLocaleString()}`, 'Balance']}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {chartData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'expenses':
                return (
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-[300px] w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: any) => `$${parseFloat(value).toLocaleString()}`} />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            {chartData.map((item: any) => (
                                <div key={item.name} className="flex items-center justify-between border-b pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="font-medium text-xs text-gray-700 truncate max-w-[150px]">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-xs">${item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'customers':
            case 'vendors':
            case 'invoices':
                return (
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-[300px] w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={chartData.filter(d => d.value > 0)}
                                        innerRadius={60}
                                        outerRadius={110}
                                        paddingAngle={2}
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={1000}
                                    >
                                        {chartData.filter(d => d.value > 0).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => [`$${parseFloat(value).toLocaleString()}`, 'Amount']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff' }}
                                        itemStyle={{ color: '#fff', fontSize: '11px' }}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Aging Breakdown</p>
                            {chartData.map((item: any) => (
                                <div key={item.name} className="flex items-center justify-between border-b border-gray-50 pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="font-medium text-xs text-gray-700">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-xs text-gray-900">${item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'accounts':
                return (
                    <div className="flex flex-col gap-8">
                        <CompanyProfileCard info={qbData?.companyInfo} />

                        <div className="flex flex-col md:flex-row items-center gap-8 pt-6 border-t">
                            <div className="h-[250px] w-full md:w-1/2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => `$${parseFloat(value).toLocaleString()}`} />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2 space-y-3">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Type Breakdown</p>
                                {chartData.map((item: any) => (
                                    <div key={item.name} className="flex items-center justify-between border-b border-gray-50 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="font-medium text-[11px] text-gray-600 truncate max-w-[140px]">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-[11px] text-gray-900">${item.value.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 gap-3 pt-4">
                                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                        <p className="text-[8px] font-bold text-blue-400 uppercase">Total Accounts</p>
                                        <p className="text-lg font-bold text-blue-900">{qbData?.allAccounts?.length || qbData?.accounts?.length || 0}</p>
                                    </div>
                                    <div className="p-3 bg-green-50/50 rounded-xl border border-green-100/50">
                                        <p className="text-[8px] font-bold text-green-400 uppercase">Active Feeds</p>
                                        <p className="text-lg font-bold text-green-900">
                                            {qbData?.accounts?.filter((a: any) => a.connectionType !== 'DISCONNECTED').length || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'cash-flow':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => `$${Math.round(val / 1000)}k`} />
                            <Tooltip formatter={(value: any) => `$${parseFloat(value).toLocaleString()}`} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );
            default:
                return <div className="flex items-center justify-center h-[300px] text-gray-500 italic">Visual summary not yet available for this view</div>;
        }
    };

    const getReportForType = () => {
        if (!qbData) return null;
        switch (type) {
            case 'profit-loss': return qbData.profitAndLoss;
            case 'sales': {
                const report = qbData.salesReport;
                if (report && report.Rows && report.Rows.Row) {
                    // Extract only the Income section to make it feel like a Sales report
                    const incomeSection = report.Rows.Row.find((r: any) =>
                        r.group === "Income" || (r.Header && r.Header.ColData && r.Header.ColData[0].value === "Income")
                    );
                    return {
                        ...report,
                        Header: {
                            ...report.Header,
                            ReportName: "Sales Performance Detail"
                        },
                        Rows: { Row: incomeSection ? [incomeSection] : report.Rows.Row }
                    };
                }
                return report;
            }
            case 'expenses': {
                const report = qbData.profitAndLoss;
                if (report && report.Rows && report.Rows.Row) {
                    // Extract only the Expense section
                    const expenseSection = report.Rows.Row.find((r: any) =>
                        r.group === "Expense" || r.group === "Expenses" || (r.Header && r.Header.ColData && r.Header.ColData[0].value === "Expenses")
                    );
                    return {
                        ...report,
                        Header: {
                            ...report.Header,
                            ReportName: "Expenses Detail"
                        },
                        Rows: { Row: expenseSection ? [expenseSection] : report.Rows.Row }
                    };
                }
                return report;
            }
            case 'customers': return {
                Header: { ReportName: "Customer Contact & Balance Detail" },
                Columns: {
                    Column: [
                        { ColTitle: "Customer Name" },
                        { ColTitle: "Email" },
                        { ColTitle: "Phone" },
                        { ColTitle: "Company" },
                        { ColTitle: "Open Balance" }
                    ]
                },
                Rows: {
                    Row: (qbData.customersList || []).map((c: any) => ({
                        type: 'Data',
                        ColData: [
                            { value: c.DisplayName },
                            { value: c.PrimaryEmailAddress?.Address || '-' },
                            { value: c.PrimaryPhone?.FreeFormNumber || '-' },
                            { value: c.CompanyName || '-' },
                            { value: `$${(c.Balance || 0).toLocaleString()}` }
                        ]
                    }))
                }
            };
            case 'vendors': return {
                Header: { ReportName: "Vendor Contact & Balance Detail" },
                Columns: {
                    Column: [
                        { ColTitle: "Vendor Name" },
                        { ColTitle: "Email" },
                        { ColTitle: "Phone" },
                        { ColTitle: "Company" },
                        { ColTitle: "Open Balance" }
                    ]
                },
                Rows: {
                    Row: (qbData.vendorsList || []).map((v: any) => ({
                        type: 'Data',
                        ColData: [
                            { value: v.DisplayName },
                            { value: v.PrimaryEmailAddress?.Address || '-' },
                            { value: v.PrimaryPhone?.FreeFormNumber || '-' },
                            { value: v.CompanyName || '-' },
                            { value: `$${(v.Balance || 0).toLocaleString()}` }
                        ]
                    }))
                }
            };
            case 'invoices': return qbData.arAging;
            case 'cash-flow': return qbData.cashFlow;
            case 'bank-accounts': return { Header: { ReportName: "Bank Accounts" }, Columns: { Column: [{ ColTitle: "Account" }, { ColTitle: "Type" }, { ColTitle: "Status" }, { ColTitle: "Balance" }] }, Rows: { Row: qbData.accounts?.map((a: any) => ({ type: 'Data', ColData: [{ value: a.Name }, { value: a.AccountType }, { value: a.connectionType }, { value: `$${(a.CurrentBalance || a.qboBalance || 0).toLocaleString()}` }] })) } };
            case 'accounts': return {
                Header: { ReportName: "Chart of Accounts Detail" },
                Columns: { Column: [{ ColTitle: "Account Name" }, { ColTitle: "Type" }, { ColTitle: "Sub Type" }, { ColTitle: "Balance" }] },
                Rows: {
                    Row: (qbData.allAccounts || qbData.accounts || []).map((a: any) => ({
                        type: 'Data',
                        ColData: [
                            { value: a.Name },
                            { value: a.AccountType },
                            { value: a.AccountSubType },
                            { value: `$${(a.CurrentBalance || a.qboBalance || 0).toLocaleString()}` }
                        ]
                    }))
                }
            };
            default: return null;
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Loading...">
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-gray-500 font-medium animate-pulse">Fetching real-time QuickBooks data...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={getTitle()}>
            <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/dashboard")}
                        className="gap-2 text-gray-600 hover:text-primary transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                    <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 text-primary rounded-lg border border-primary/10 shadow-sm">
                        {getIcon()}
                        <span className="font-bold text-xs uppercase tracking-widest">{type?.replace('-', ' ')}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-none shadow-xl shadow-blue-900/5 ring-1 ring-gray-100 overflow-hidden">
                        <CardHeader className="border-b bg-gray-50/30">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Visual Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {renderChart()}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-blue-900/5 ring-1 ring-gray-100 overflow-hidden">
                        <CardHeader className="border-b bg-gray-50/30">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-primary" />
                                Quick Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Total for Period</p>
                                <p className="text-5xl font-display font-bold text-gray-900">${summaryInfo.total.toLocaleString()}</p>
                                {summaryInfo.trend !== 0 && (
                                    <div className={cn("flex items-center gap-1.5 font-bold text-sm", summaryInfo.trend > 0 ? "text-green-600" : "text-red-500")}>
                                        {summaryInfo.trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                        <span>{Math.abs(summaryInfo.trend)}% vs prior period</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 border-t space-y-5">
                                <div className="flex justify-between items-center group">
                                    <span className="text-xs text-gray-500 font-medium group-hover:text-primary transition-colors">{summaryInfo.insightLabel}</span>
                                    <span className="text-xs font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">{summaryInfo.insightValue}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-medium">Report Type</span>
                                    <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/5 rounded">Standard</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-medium">Last Updated</span>
                                    <span className="text-xs font-bold italic text-gray-400">
                                        {qbData?.lastUpdated ? new Date(qbData.lastUpdated).toLocaleTimeString() : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
                    <QuickBooksReportDetail
                        data={getReportForType()}
                        onBack={() => navigate("/dashboard")}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

export default DashboardDetail;
