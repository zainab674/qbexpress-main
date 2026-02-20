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


import { QuickBooksReportDetail } from "@/components/dashboard/QuickBooksReportDetail";
import { API_ENDPOINTS } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Link2, Plus } from "lucide-react";
import { WidgetSelectionDialog } from "@/components/dashboard/WidgetSelectionDialog";

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
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            const userStr = localStorage.getItem('qb_user');
            if (!userStr) { navigate("/login"); return; }
            const user = JSON.parse(userStr);
            try {
                // Fetch reports
                const res = await fetch(`${API_ENDPOINTS.REPORTS}/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReports(data || []);
                }

                // Fetch QuickBooks status
                // Fetch QuickBooks status
                const statusRes = await fetch(`${API_ENDPOINTS.QUICKBOOKS.STATUS}/${user.id}`);
                if (statusRes.ok) {
                    const data = await statusRes.json();
                    setIsConnected(data.connected);

                    // If connected, fetch real QB data
                    if (data.connected) {
                        const overviewRes = await fetch(`${API_ENDPOINTS.QUICKBOOKS.OVERVIEW}/${user.id}`);
                        if (overviewRes.ok) {
                            const overviewData = await overviewRes.json();
                            setQbData(overviewData);
                        } else if (overviewRes.status === 401) {
                            // Token expired or invalid
                            setIsConnected(false);
                            setQbData(null);
                        }
                    }

                    // Fetch selected widgets
                    const widgetsRes = await fetch(`${API_ENDPOINTS.USERS}/${user.id}/widgets`);
                    if (widgetsRes.ok) {
                        const data = await widgetsRes.json();
                        setSelectedWidgets(data.selectedWidgets || []);
                    }
                }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchReports();
    }, [navigate]);

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
                    {isConnected && !qbData && (
                        <div className="col-span-full py-12 text-center text-gray-500 italic">
                            Fetching latest QuickBooks data...
                        </div>
                    )}

                    {qbData && Object.entries(qbData).map(([key, value]) => {
                        if (key === 'lastUpdated') return null;

                        const title = key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())
                            .trim();

                        // Use Visual Cards if available
                        if (key === 'profitAndLoss') {
                            return (
                                <>
                                    {selectedWidgets.includes('profitAndLoss') && (
                                        <div key="profitAndLoss" className="lg:col-span-1">
                                            <ProfitLossCard data={value} />
                                        </div>
                                    )}
                                    {selectedWidgets.includes('expensesCard') && (
                                        <div key="expensesCard" className="lg:col-span-1">
                                            <ExpensesCard data={value} />
                                        </div>
                                    )}
                                </>
                            );
                        }

                        if (key === 'cashFlow' && selectedWidgets.includes('cashFlow')) {
                            return (
                                <div key={key} className="lg:col-span-1">
                                    <CashFlowCard
                                        cashFlow={value}
                                        data={qbData.profitAndLoss}
                                        balanceSheet={qbData.balanceSheet}
                                        accounts={qbData.accounts}
                                    />
                                </div>
                            );
                        }

                        if (key === 'accounts' && Array.isArray(value)) {
                            return (
                                <>
                                    {selectedWidgets.includes('accounts') && (
                                        <div key="accounts" className="lg:col-span-1">
                                            <BankAccountsCard
                                                accounts={value}
                                                balanceSheet={qbData.balanceSheet}
                                                reviewTransactions={qbData.reviewTransactions}
                                            />
                                        </div>
                                    )}
                                    {selectedWidgets.includes('accountDetails') && (
                                        <div key="accountDetails" className="lg:col-span-1">
                                            <AccountDetailsCard accounts={value} />
                                        </div>
                                    )}
                                </>
                            );
                        }

                        if (key === 'customerStatus' && selectedWidgets.includes('customerStatus')) {
                            return (
                                <div key={key} className="lg:col-span-1">
                                    <CustomersCard data={value} />
                                </div>
                            );
                        }

                        if (key === 'vendorStatus' && selectedWidgets.includes('vendorStatus')) {
                            return (
                                <div key={key} className="lg:col-span-1">
                                    <VendorsCard data={value} />
                                </div>
                            );
                        }


                        if (key === 'arAging' && selectedWidgets.includes('arAging')) {
                            return (
                                <div key={key} className="lg:col-span-1">
                                    <AgingCard
                                        title="ACCOUNTS RECEIVABLE"
                                        data={qbData.arAgingDetail || value}
                                        type="AR"
                                        onViewDetail={() => {
                                            setSelectedQBReportData(qbData.arAgingDetail);
                                            setViewingQBReport(true);
                                        }}
                                    />
                                </div>
                            );
                        }

                        if (key === 'apAging' && selectedWidgets.includes('apAging')) {
                            return (
                                <div key={key} className="lg:col-span-1">
                                    <AgingCard
                                        title="ACCOUNTS PAYABLE"
                                        data={qbData.apAgingDetail || value}
                                        type="AP"
                                        onViewDetail={() => {
                                            setSelectedQBReportData(qbData.apAgingDetail);
                                            setViewingQBReport(true);
                                        }}
                                    />
                                </div>
                            );
                        }

                        if (key === 'salesReport' && selectedWidgets.includes('salesReport')) {
                            return (
                                <div key={key} className="lg:col-span-1">
                                    <SalesCard data={value} />
                                </div>
                            );
                        }


                        // Skip if already handled
                        if (
                            key === 'profitAndLoss' ||
                            key === 'salesReport' ||
                            key === 'cashFlow' ||
                            key === 'accounts' ||
                            key === 'bankAccounts' ||
                            key === 'balanceSheet' ||
                            key === 'reviewTransactions' ||
                            key === 'invoiceStatus' ||
                            key === 'customerStatus' ||
                            key === 'vendorStatus' ||
                            key === 'arAging' ||
                            key === 'apAging' ||
                            key === 'arAgingDetail' ||
                            key === 'apAgingDetail'


                        ) return null;

                        if (Array.isArray(value)) {
                            return (
                                <div key={key} className="lg:col-span-1">
                                    <DynamicAccountsCard title={title} data={value} />
                                </div>
                            );
                        } else if (typeof value === 'object' && value !== null) {
                            return (
                                <div key={key} className="lg:col-span-1">
                                    <DynamicReportCard title={title} data={value} />
                                </div>
                            );
                        }
                        return null;
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
