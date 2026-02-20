import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Wallet, Receipt, TrendingUp, CreditCard, PieChart } from "lucide-react";
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
    Pie
} from "recharts";

const DashboardDetail = () => {
    const { type } = useParams<{ type: string }>();
    const navigate = useNavigate();

    const getTitle = () => {
        switch (type) {
            case 'invoices': return "Invoices Detail";
            case 'sales': return "Sales Performance";
            case 'profit-loss': return "Profit and Loss Detail";
            case 'expenses': return "Expenses Breakdown";
            case 'cash-flow': return "Cash Flow Analysis";
            case 'bank-accounts': return "Bank Accounts Overview";
            default: return "Detail View";
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'invoices': return <Receipt className="w-5 h-5" />;
            case 'sales': return <TrendingUp className="w-5 h-5" />;
            case 'profit-loss': return <ArrowUpRight className="w-5 h-5" />;
            case 'expenses': return <ArrowDownLeft className="w-5 h-5" />;
            case 'cash-flow': return <Wallet className="w-5 h-5" />;
            case 'bank-accounts': return <CreditCard className="w-5 h-5" />;
            default: return <PieChart className="w-5 h-5" />;
        }
    };

    const salesData = [
        { name: 'Jan', value: 4000 },
        { name: 'Feb', value: 3000 },
        { name: 'Mar', value: 3500 },
        { name: 'Apr', value: 4500 },
        { name: 'May', value: 5000 },
        { name: 'Jun', value: 5500 },
    ];

    const cashFlowData = [
        { name: 'Jan', in: 5000, out: 4000 },
        { name: 'Feb', in: 6000, out: 4500 },
        { name: 'Mar', in: 5500, out: 4200 },
        { name: 'Apr', in: 7000, out: 5000 },
        { name: 'May', in: 7500, out: 5500 },
        { name: 'Jun', in: 8000, out: 6000 },
    ];

    const expenseData = [
        { name: 'Rent', value: 6500, color: '#00a1b1' },
        { name: 'Automotive', value: 5250, color: '#00727c' },
        { name: 'Meals', value: 2250, color: '#bfe1e5' },
        { name: 'Payroll', value: 8000, color: '#2ca01c' },
        { name: 'Utilities', value: 1200, color: '#ff8a00' },
    ];

    const transactions = [
        { id: 1, date: '2024-03-25', description: 'Amazon Web Services', category: 'Utilities', amount: -450.00, status: 'Completed' },
        { id: 2, date: '2024-03-24', description: 'Client Payment - ABC Corp', category: 'Sales', amount: 2500.00, status: 'Completed' },
        { id: 3, date: '2024-03-22', description: 'Office Rent - Prime Realty', category: 'Rent', amount: -6500.00, status: 'Completed' },
        { id: 4, date: '2024-03-20', description: 'Stripe Payout', category: 'Sales', amount: 1200.50, status: 'Pending' },
        { id: 5, date: '2024-03-18', description: 'Apple Store', category: 'Equipment', amount: -2100.00, status: 'Completed' },
    ];

    const renderChart = () => {
        switch (type) {
            case 'sales':
            case 'invoices':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#2ca01c" strokeWidth={3} dot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'cash-flow':
            case 'profit-loss':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={cashFlowData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                            <Tooltip />
                            <Bar dataKey="in" fill="#2ca01c" radius={[4, 4, 0, 0]} name="Money In" />
                            <Bar dataKey="out" fill="#00a1b1" radius={[4, 4, 0, 0]} name="Money Out" />
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
                                        data={expenseData}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expenseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            {expenseData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between border-b pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <span className="font-bold">${item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return <div className="flex items-center justify-center h-[300px] text-gray-500 italic">No visual data available for this view</div>;
        }
    };

    return (
        <DashboardLayout title={getTitle()}>
            <div className="max-w-6xl mx-auto space-y-6 pb-20">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/dashboard")}
                        className="gap-2 text-gray-600 hover:text-primary"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                    <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 text-primary rounded-lg border border-primary/10">
                        {getIcon()}
                        <span className="font-bold text-sm uppercase tracking-wider">{type?.replace('-', ' ')}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Visual Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderChart()}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Quick Insights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total for Period</p>
                                <p className="text-4xl font-display font-bold text-gray-900">$24,582.40</p>
                                <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                                    <ArrowUpRight className="w-4 h-4" />
                                    <span>12.5% vs last month</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Highest Category</span>
                                    <span className="text-sm font-bold">Professional Services</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Active Items</span>
                                    <span className="text-sm font-bold">34 entries</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Last Updated</span>
                                    <span className="text-sm font-bold italic text-gray-400">2 hours ago</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b">
                        <CardTitle className="text-lg font-bold">Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/80 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-600">{t.date}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{t.description}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{t.category}</span>
                                            </td>
                                            <td className={`px-6 py-4 text-sm font-bold text-right ${t.amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                {t.amount < 0 ? '-' : '+'}${Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                    <span className={`text-xs font-bold ${t.status === 'Completed' ? 'text-green-700' : 'text-yellow-700'}`}>{t.status}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default DashboardDetail;
