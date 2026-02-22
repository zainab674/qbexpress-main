import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ChevronDown, Settings, MoreVertical, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PeriodKey, PERIODS } from "@/lib/date-utils";
import { PeriodSelector } from "./PeriodSelector";

export const BankAccountsCard = ({
    accounts: accountData,
    bankAccounts: neoAccounts,
    balanceSheet,
    reviewTransactions,
    period = 'today',
    onPeriodChange
}: {
    accounts?: any[],
    bankAccounts?: any[],
    balanceSheet?: any,
    reviewTransactions?: any,
    period?: PeriodKey,
    onPeriodChange?: (period: PeriodKey) => void
}) => {
    const navigate = useNavigate();

    // Map account data using pre-merged backend fields
    const accounts = (accountData && accountData.length > 0) ? accountData.map((acc: any) => {
        const isCreditCard = acc.AccountType === 'Credit Card';

        // prioritize feed bankBalance, fallback to qbBalance
        const rawBankBalance = (acc.connectionType === "ACTIVE" && acc.bankBalance !== null)
            ? acc.bankBalance
            : acc.qboBalance;

        // Note: Credit cards are liabilities. In API, a positive balance is debt.
        // Dashboard shows them as negative when calculating total cash.
        const finalBankBalance = (isCreditCard && rawBankBalance > 0) ? -rawBankBalance : rawBankBalance;
        const finalQbBalance = (isCreditCard && acc.qboBalance > 0) ? -acc.qboBalance : acc.qboBalance;

        return {
            name: acc.Name,
            bankBalance: finalBankBalance,
            qbBalance: finalQbBalance,
            toReview: acc.unmatchedCount || 0,
            updated: acc.lastUpdateTime ? `Updated ${new Date(acc.lastUpdateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Updated moments ago',
            fiName: acc.fiName,
            connectionType: acc.connectionType
        };
    }) : [];

    // Calculate total from individual accounts
    let totalBankBalance = accounts.reduce((sum, curr) => sum + curr.bankBalance, 0);


    return (
        <Card
            className="border-none shadow-sm cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all active:scale-[0.98] flex flex-col"
            onClick={() => navigate("/dashboard/detail/bank-accounts")}
        >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4">
                <div>
                    <CardTitle className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">BANK ACCOUNTS</CardTitle>
                </div>
                {onPeriodChange && (
                    <PeriodSelector
                        currentPeriod={period}
                        onPeriodChange={onPeriodChange}
                        availablePeriods={['today', 'lastMonth', 'lastQuarter', 'lastYear']}
                    />
                )}
            </CardHeader>
            <CardContent className="flex-1 px-4">
                <div className="space-y-1 mb-6">
                    <div className="text-[12px] text-gray-500">{PERIODS[period]} bank balance</div>
                    <div className="flex items-center gap-2">
                        <div className="text-3xl font-bold font-sans tracking-tight text-gray-800">
                            {totalBankBalance < 0 ? '-' : ''}${Math.abs(totalBankBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <Info className="w-4 h-4 text-blue-500 fill-blue-50" />
                    </div>
                </div>

                <div className="space-y-6">
                    {accounts.map((account) => (
                        <div key={account.name} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#0077c5] flex items-center justify-center shrink-0">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="text-[13px] font-bold text-gray-800 leading-none mb-1">{account.name}</div>
                                <div className="flex justify-between items-center h-4">
                                    <div className="text-[11px] text-gray-500">Bank balance</div>
                                    <div className="text-[11px] text-gray-800 font-medium">${account.bankBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div className="flex justify-between items-center h-4">
                                    <div className="text-[11px] text-gray-500">In QuickBooks</div>
                                    <div className="text-[11px] text-gray-800 font-medium">${account.qbBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-gray-100 mt-2">
                                    <div className="text-[10px] text-gray-400 italic">
                                        {account.updated}
                                    </div>
                                    <div className="text-[11px] text-blue-600 font-semibold hover:underline">
                                        {account.toReview} to review
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <div className="mt-8 px-4 py-4 border-t flex items-center justify-between bg-gray-50/30 rounded-b-xl">
                <div className="flex items-center gap-1 text-[13px] text-[#2ca01c] font-bold">
                    Go to registers <ChevronDown className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    <MoreVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                </div>
            </div>
        </Card>
    );
};
