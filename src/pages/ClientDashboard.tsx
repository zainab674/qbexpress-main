import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BankAccountsCard } from "@/components/dashboard/BankAccountsCard";
import { CashFlowCard } from "@/components/dashboard/CashFlowCard";
import { ExpensesCard } from "@/components/dashboard/ExpensesCard";
import { ProfitLossCard } from "@/components/dashboard/ProfitLossCard";
import { ReportDetailView } from "@/components/dashboard/ReportDetailView";
import { DynamicReportCard } from "@/components/dashboard/DynamicReportCard";
import { DynamicAccountsCard } from "@/components/dashboard/DynamicAccountsCard";
import { SalesCard } from "@/components/dashboard/SalesCard";
import { CustomersCard } from "@/components/dashboard/CustomersCard";
import { VendorsCard } from "@/components/dashboard/VendorsCard";
import { AgingCard } from "@/components/dashboard/AgingCard";
import { AccountDetailsCard } from "@/components/dashboard/AccountDetailsCard";
import { CompanyProfileCard, CompanyInfo } from "@/components/dashboard/CompanyProfileCard";
import { UploadedReportCard } from "@/components/dashboard/UploadedReportCard";

import { QuickBooksReportDetail } from "@/components/dashboard/QuickBooksReportDetail";
import { API_ENDPOINTS } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Link2, Plus } from "lucide-react";
import { WidgetSelectionDialog } from "@/components/dashboard/WidgetSelectionDialog";
import { PeriodKey, getDateRangeForPeriod } from "@/lib/date-utils";

interface Report {
    _id: string;
    fileName: string;
    uploadedAt: string;
    data: any;
}

const ClientDashboard = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [viewingQBReport, setViewingQBReport] = useState<boolean>(false);
    const [selectedQBReportData, setSelectedQBReportData] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [qbData, setQbData] = useState<any>(null);
    const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
    const [isWidgetDialogOpen, setIsWidgetDialogOpen] = useState(false);
    const [widgetPeriods, setWidgetPeriods] = useState<Record<string, PeriodKey>>({
        profitAndLoss: 'last30Days',
        salesReport: 'thisYear',
        cashFlow: 'last30Days',
        expensesCard: 'thisMonth',
        arAging: 'today',
        apAging: 'today',
        accounts: 'today',
        customerStatus: 'thisYear',
        vendorStatus: 'thisYear',
    });
    const navigate = useNavigate();

    const updateQbData = (key: string, data: any) => {
        setQbData((prev: any) => ({ ...(prev || {}), [key]: data }));
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            const userStr = localStorage.getItem('qb_user');
            if (!userStr) { navigate("/login"); return; }
            const user = JSON.parse(userStr);

            try {
                // Fetch basic non-QB info in parallel
                const [reportsRes, statusRes, widgetsRes] = await Promise.all([
                    fetch(`${API_ENDPOINTS.REPORTS}/${user.id}`),
                    fetch(`${API_ENDPOINTS.QUICKBOOKS.STATUS}/${user.id}`),
                    fetch(`${API_ENDPOINTS.USERS}/${user.id}/widgets`)
                ]);

                if (reportsRes.ok) setReports(await reportsRes.json());
                if (widgetsRes.ok) {
                    const data = await widgetsRes.json();
                    setSelectedWidgets(data.selectedWidgets || []);
                }

                if (statusRes.ok) {
                    const data = await statusRes.json();
                    setIsConnected(data.connected);
                    if (data.connected) {
                        fetchQuickBooksDashboardData(user.id);
                    }
                }
            } catch (error) {
                console.error("Initial fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchQuickBooksDashboardData = async (userId: string) => {
            // Initial batch fetch
            const widgetsToFetch = ['profitAndLoss', 'salesReport', 'cashFlow', 'accounts', 'balanceSheet', 'customerStatus', 'vendorStatus', 'arAging', 'apAging', 'arAgingDetail', 'apAgingDetail', 'companyInfo'];
            widgetsToFetch.forEach(widgetId => {
                fetchWidgetData(userId, widgetId, widgetPeriods[widgetId] || (widgetId === 'companyInfo' ? 'today' : 'last30Days'));
            });
        };

        fetchInitialData();
    }, [navigate]);

    const fetchWidgetData = async (userId: string, widgetId: string, period: PeriodKey) => {
        const { startDate, endDate } = getDateRangeForPeriod(period);
        let url = '';
        let dataKey = widgetId;

        switch (widgetId) {
            case 'profitAndLoss':
                url = `${API_ENDPOINTS.QUICKBOOKS.REPORTS}/ProfitAndLoss/${userId}?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Month`;
                break;
            case 'salesReport':
                url = `${API_ENDPOINTS.QUICKBOOKS.REPORTS}/ProfitAndLoss/${userId}?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Month`;
                break;
            case 'expensesCard':
                url = `${API_ENDPOINTS.QUICKBOOKS.REPORTS}/ProfitAndLoss/${userId}?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Month`;
                break;
            case 'cashFlow':
                url = `${API_ENDPOINTS.QUICKBOOKS.REPORTS}/CashFlow/${userId}?start_date=${startDate}&end_date=${endDate}&accounting_method=Cash`;
                break;
            case 'accounts':
                url = `${API_ENDPOINTS.QUICKBOOKS.ACCOUNTS}/${userId}`;
                break;
            case 'balanceSheet':
                url = `${API_ENDPOINTS.QUICKBOOKS.REPORTS}/BalanceSheet/${userId}?as_of_date=${endDate}&accounting_method=Cash`;
                break;
            case 'customerStatus':
                url = `${API_ENDPOINTS.QUICKBOOKS.DASHBOARD.CUSTOMER_STATUS}/${userId}`;
                break;
            case 'vendorStatus':
                url = `${API_ENDPOINTS.QUICKBOOKS.DASHBOARD.VENDOR_STATUS}/${userId}`;
                break;
            case 'arAging':
            case 'arAgingDetail':
                url = `${API_ENDPOINTS.QUICKBOOKS.REPORTS}/AgedReceivableDetail/${userId}?as_of_date=${endDate}`;
                dataKey = 'arAgingDetail';
                break;
            case 'apAging':
            case 'apAgingDetail':
                url = `${API_ENDPOINTS.QUICKBOOKS.REPORTS}/AgedPayableDetail/${userId}?as_of_date=${endDate}`;
                dataKey = 'apAgingDetail';
                break;
            case 'companyInfo':
                url = `${API_ENDPOINTS.QUICKBOOKS.COMPANY_INFO}/${userId}`;
                break;
            default:
                return;
        }

        try {
            const res = await fetch(url);
            if (!res.ok) {
                const text = await res.text();
                console.error(`Failed to fetch ${widgetId} from ${url}: ${res.status} ${res.statusText}. Response: ${text}`);
                return;
            }

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const text = await res.text();
                if (!text) {
                    console.warn(`Empty response body for ${widgetId} from ${url}`);
                    return;
                }
                const data = JSON.parse(text);
                updateQbData(dataKey, data);
            }
        } catch (e) {
            console.error(`Error processing ${widgetId} from ${url}:`, e);
        }
    };

    const handlePeriodChange = (widgetId: string, period: PeriodKey) => {
        setWidgetPeriods(prev => ({ ...prev, [widgetId]: period }));
        const userStr = localStorage.getItem('qb_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            fetchWidgetData(user.id, widgetId, period);
        }
    };

    const handleConnectQB = async () => {
        const userStr = localStorage.getItem('qb_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);

        try {
            const res = await fetch(`${API_ENDPOINTS.QUICKBOOKS.AUTH}?userId=${user.id}`);
            const data = await res.json();
            if (data.authUri) {
                window.location.href = data.authUri;
            }
        } catch (error) {
            console.error("Error initiating QB auth:", error);
        }
    };

    return (
        <DashboardLayout
            title={viewingQBReport ? "Report Detail" : selectedReport ? `Report: ${selectedReport.fileName}` : "Business overview"}
            onReportSelect={(report) => {
                setSelectedReport(report);
                setViewingQBReport(false);
            }}
            headerActions={
                <div className="flex items-center gap-3">
                    {isConnected ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Connected to QuickBooks
                        </div>
                    ) : (
                        <Button
                            onClick={handleConnectQB}
                            variant="outline"
                            className="gap-2 border-primary/20 hover:border-primary/40"
                        >
                            <Link2 className="w-4 h-4" />
                            Connect QuickBooks
                        </Button>
                    )}
                    <Button
                        onClick={() => setIsWidgetDialogOpen(true)}
                        variant="ghost"
                        className="gap-2 text-slate-600 hover:text-slate-900"
                    >
                        <Plus className="w-4 h-4" />
                        Add widgets
                    </Button>
                </div>
            }
        >
            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : viewingQBReport ? (
                <div className="max-w-6xl mx-auto">
                    <QuickBooksReportDetail
                        data={selectedQBReportData}
                        onBack={() => setViewingQBReport(false)}
                    />
                </div>
            ) : selectedReport ? (
                <div className="max-w-5xl mx-auto">
                    <ReportDetailView report={selectedReport} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedWidgets.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400">
                            No widgets selected. Click "Add widgets" to customize your dashboard.
                        </div>
                    )}

                    {selectedWidgets.map(widgetId => {
                        if (widgetId === 'reports') {
                            if (reports.length === 0) {
                                return (
                                    <div key="reports-empty" className="lg:col-span-1 h-[240px] bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center">
                                        <p className="text-slate-500 text-sm">No uploaded reports available.</p>
                                    </div>
                                );
                            }
                            return reports.map((report) => (
                                <div key={`report-${report._id}`} className="lg:col-span-1">
                                    <UploadedReportCard
                                        report={report}
                                        onClick={() => {
                                            setSelectedReport(report);
                                            setViewingQBReport(false);
                                        }}
                                    />
                                </div>
                            ));
                        }

                        if (!isConnected) return null;

                        const getLoadingKey = (id: string) => {
                            if (id === 'expensesCard') return 'profitAndLoss';
                            if (id === 'accountDetails') return qbData.allAccounts ? 'allAccounts' : 'accounts';
                            if (id === 'companyProfile') return 'companyInfo';
                            if (id === 'arAging') return 'arAgingDetail';
                            if (id === 'apAging') return 'apAgingDetail';
                            return id;
                        };

                        const isLoading = !qbData || !qbData[getLoadingKey(widgetId)];

                        // Special cases for combined dependencies
                        let hasDependencies = true;
                        if (widgetId === 'cashFlow' && (!qbData?.cashFlow || !qbData?.profitAndLoss)) hasDependencies = false;
                        if (widgetId === 'accounts' && !qbData?.accounts) hasDependencies = false;

                        if (isLoading || !hasDependencies) {
                            return (
                                <div key={widgetId} className="lg:col-span-1 h-[240px] bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-center animate-pulse">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading...</span>
                                    </div>
                                </div>
                            );
                        }

                        switch (widgetId) {
                            case 'profitAndLoss':
                                return <div key="profitAndLoss" className="lg:col-span-1"><ProfitLossCard data={qbData.profitAndLoss} period={widgetPeriods.profitAndLoss} onPeriodChange={(p) => handlePeriodChange('profitAndLoss', p)} /></div>;
                            case 'expensesCard':
                                return <div key="expensesCard" className="lg:col-span-1"><ExpensesCard data={qbData.expensesCard || qbData.profitAndLoss} period={widgetPeriods.expensesCard} onPeriodChange={(p) => handlePeriodChange('expensesCard', p)} /></div>;
                            case 'cashFlow':
                                return (
                                    <div key="cashFlow" className="lg:col-span-1">
                                        <CashFlowCard
                                            cashFlow={qbData.cashFlow}
                                            data={qbData.profitAndLoss}
                                            balanceSheet={qbData.balanceSheet}
                                            accounts={qbData.accounts}
                                            period={widgetPeriods.cashFlow}
                                            onPeriodChange={(p) => handlePeriodChange('cashFlow', p)}
                                        />
                                    </div>
                                );
                            case 'accounts':
                                return (
                                    <div key="accounts" className="lg:col-span-1">
                                        <BankAccountsCard
                                            accounts={qbData.accounts}
                                            balanceSheet={qbData.balanceSheet}
                                            reviewTransactions={qbData.reviewTransactions}
                                            period={widgetPeriods.accounts}
                                            onPeriodChange={(p) => handlePeriodChange('accounts', p)}
                                        />
                                    </div>
                                );
                            case 'accountDetails':
                                return (
                                    <div key="accountDetails" className="lg:col-span-1">
                                        <AccountDetailsCard accounts={qbData.allAccounts || qbData.accounts} />
                                    </div>
                                );
                            case 'customerStatus':
                                return <div key="customerStatus" className="lg:col-span-1"><CustomersCard data={qbData.customerStatus} /></div>;
                            case 'vendorStatus':
                                return <div key="vendorStatus" className="lg:col-span-1"><VendorsCard data={qbData.vendorStatus} /></div>;
                            case 'arAging':
                                return (
                                    <div key="arAging" className="lg:col-span-1">
                                        <AgingCard
                                            title="ACCOUNTS RECEIVABLE"
                                            data={qbData.arAgingDetail || qbData.arAging}
                                            type="AR"
                                            period={widgetPeriods.arAging}
                                            onPeriodChange={(p) => handlePeriodChange('arAging', p)}
                                            onViewDetail={() => {
                                                setSelectedQBReportData(qbData.arAgingDetail || qbData.arAging);
                                                setViewingQBReport(true);
                                            }}
                                        />
                                    </div>
                                );
                            case 'apAging':
                                return (
                                    <div key="apAging" className="lg:col-span-1">
                                        <AgingCard
                                            title="ACCOUNTS PAYABLE"
                                            data={qbData.apAgingDetail || qbData.apAging}
                                            type="AP"
                                            period={widgetPeriods.apAging}
                                            onPeriodChange={(p) => handlePeriodChange('apAging', p)}
                                            onViewDetail={() => {
                                                setSelectedQBReportData(qbData.apAgingDetail || qbData.apAging);
                                                setViewingQBReport(true);
                                            }}
                                        />
                                    </div>
                                );
                            case 'salesReport':
                                return <div key="salesReport" className="lg:col-span-1"><SalesCard data={qbData.salesReport} period={widgetPeriods.salesReport} onPeriodChange={(p) => handlePeriodChange('salesReport', p)} /></div>;
                            case 'companyProfile':
                                return <div key="companyProfile" className="lg:col-span-1"><CompanyProfileCard info={qbData.companyInfo} /></div>;
                            default:
                                return null;
                        }
                    })}
                </div>
            )}

            <WidgetSelectionDialog
                isOpen={isWidgetDialogOpen}
                onClose={() => setIsWidgetDialogOpen(false)}
                selectedWidgets={selectedWidgets}
                onUpdate={setSelectedWidgets}
                userId={JSON.parse(localStorage.getItem('qb_user') || '{}').id}
            />
        </DashboardLayout>
    );
};

export default ClientDashboard;
