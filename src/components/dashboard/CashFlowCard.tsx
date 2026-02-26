import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreVertical, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { PeriodKey, PERIODS } from "@/lib/date-utils";
import { PeriodSelector } from "./PeriodSelector";

export const CashFlowCard = ({
    data,
    cashFlow,
    balanceSheet,
    accounts: accountData,
    period = 'last30Days',
    onPeriodChange
}: {
    data?: any,
    cashFlow?: any,
    balanceSheet?: any,
    accounts?: any[],
    period?: PeriodKey,
    onPeriodChange?: (period: PeriodKey) => void
}) => {
    const navigate = useNavigate();
    const [view, setView] = useState<"balance" | "money">("balance");

    // Default static data
    let chartData: any[] = [];
    let cashBalance = 0;

    // Calculate total from individual accounts (matching BankAccountsCard)
    if (accountData && accountData.length > 0) {
        cashBalance = accountData.reduce((acc: number, curr: any) => {
            const isCreditCard = curr.AccountType === 'Credit Card';

            // prioritize live bankBalance if active, fallback to ledger qboBalance
            // backend already provides bankBalance which defaults to qbBalance if no feed exists
            const rawBankBal = (curr.connectionType === "ACTIVE" && curr.bankBalance !== null)
                ? curr.bankBalance
                : curr.qboBalance;

            // Handle credit card signs: subtract if it matches QB dashboard behavior for net cash
            const bankBal = (isCreditCard && rawBankBal > 0) ? -rawBankBal : rawBankBal;

            return acc + bankBal;
        }, 0);
    }




    if (data && data.Columns && data.Columns.Column) {
        const columns = data.Columns.Column;
        const rows = data.Rows.Row;

        const totalIdx = columns.findIndex((c: any) => c.ColTitle === "Total" || (c.MetaData && c.MetaData.some((m: any) => m.Value === "total")));
        const finalIdx = totalIdx !== -1 ? totalIdx : columns.length - 1;

        const incomeRow = rows.find((r: any) => r.group === "Income");
        const expenseRow = rows.find((r: any) => r.group === "Expense" || r.group === "Expenses" || (r.Header && r.Header.ColData && r.Header.ColData[0].value === "Expenses"));

        if (incomeRow && expenseRow) {
            const incomeData = incomeRow.ColData || (incomeRow.Summary && incomeRow.Summary.ColData);
            const expenseData = expenseRow.ColData || (expenseRow.Summary && expenseRow.Summary.ColData);

            if (incomeData && expenseData) {
                chartData = columns
                    .map((col: any, idx: number) => ({ idx, name: col.ColTitle.split(' ')[0], type: col.ColType }))
                    .filter((c: any, i: number) => i > 0 && i < finalIdx)
                    .map((c: any) => ({
                        name: c.name.toUpperCase(),
                        moneyIn: incomeData[c.idx] ? parseFloat(incomeData[c.idx].value || 0) : 0,
                        moneyOut: expenseData[c.idx] ? parseFloat(expenseData[c.idx].value || 0) : 0,
                        balance: 0 // Will calculate cumulative balance
                    }));

                // Calculate cumulative balance for the line/area chart
                let currentBal = 0;
                chartData = chartData.map(d => {
                    currentBal += (d.moneyIn - d.moneyOut);
                    return { ...d, balance: currentBal };
                });
            }
        }
    }

    return (
        <Card
            className="border-none shadow-sm cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all active:scale-[0.98] bg-white group"
            onClick={() => navigate("/dashboard/detail/cash-flow")}
        >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-0 pt-6 px-6">
                <div className="space-y-1">
                    <CardTitle className="text-[13px] font-bold text-gray-800 uppercase tracking-[0.05em] font-sans">
                        CASH FLOW (LINKED BANK TRANSACTIONS)
                    </CardTitle>
                    <div className="text-[11px] italic text-gray-500 font-sans">
                        Last updated 1 hours ago
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onPeriodChange && (
                        <PeriodSelector currentPeriod={period} onPeriodChange={onPeriodChange} />
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <div className="text-[14px] text-gray-700 font-sans mb-1">Today's cash balance</div>
                        <div className={cn(
                            "text-[34px] font-medium font-sans leading-tight tracking-tight",
                            cashBalance < 0 ? "text-gray-900" : "text-gray-900"
                        )}>
                            {cashBalance < 0 ? `-$${Math.abs(cashBalance).toLocaleString()}` : `$${cashBalance.toLocaleString()}`}
                        </div>
                    </div>

                    <div className="flex bg-gray-100/50 p-0.5 rounded-sm border border-gray-200/60 shadow-inner">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); setView("balance"); }}
                            className={cn(
                                "h-[26px] px-3 text-[11px] font-bold rounded-sm transition-all duration-200",
                                view === "balance"
                                    ? "bg-[#556066] text-white shadow-sm hover:bg-[#556066]/90"
                                    : "text-gray-600 hover:bg-gray-200/50"
                            )}
                        >
                            Cash balance
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); setView("money"); }}
                            className={cn(
                                "h-[26px] px-3 text-[11px] font-bold rounded-sm transition-all duration-200",
                                view === "money"
                                    ? "bg-[#556066] text-white shadow-sm hover:bg-[#556066]/90"
                                    : "text-gray-600 hover:bg-gray-200/50"
                            )}
                        >
                            Money in/out
                        </Button>
                    </div>
                </div>

                <div className="h-[180px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        {view === "balance" ? (
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2ca01c" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2ca01c" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#d32f2f" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                                    tickFormatter={(value) => value === 0 ? "0" : `${value / 1000}K`}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#9ca3af', strokeWidth: 1 }}
                                    contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                                />
                                <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1.5} />
                                <Area
                                    type="monotone"
                                    dataKey="balance"
                                    stroke="#2ca01c"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorBalance)"
                                    isAnimationActive={true}
                                />
                                {/* Overlay area for negative values - simplified for recharts */}
                            </AreaChart>
                        ) : (
                            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                                    tickFormatter={(value) => value === 0 ? "0" : `${value / 1000}K`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                                />
                                <Bar dataKey="moneyIn" fill="#2ca01c" radius={[1, 1, 0, 0]} barSize={24} name="Money in" />
                                <Bar dataKey="moneyOut" fill="#00a1b1" radius={[1, 1, 0, 0]} barSize={24} name="Money out" />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-8 justify-start text-[11px] font-medium text-gray-600 ml-4">
                    {view === "balance" ? (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#2ca01c]" /> Cash balance
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-md border-b-[3px] border-l-[3px] border-[#2ca01c] border-dashed bg-transparent rotate-[-45deg] mr-1" /> Projected balance
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-[2px] bg-gray-400" /> Threshold
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm bg-[#2ca01c]" /> Money in
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm bg-[#00a1b1]" /> Money out
                            </div>
                        </>
                    )}
                </div>


            </CardContent>
        </Card>
    );
};
