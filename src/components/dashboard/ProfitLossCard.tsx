import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, Info, MoreVertical, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PeriodKey, PERIODS } from "@/lib/date-utils";
import { PeriodSelector } from "./PeriodSelector";

export const ProfitLossCard = ({
    data,
    period = 'last30Days',
    onPeriodChange
}: {
    data?: any;
    period?: PeriodKey;
    onPeriodChange?: (period: PeriodKey) => void;
}) => {
    const navigate = useNavigate();

    // Default values
    let income = 0;
    let expenses = 0;
    let netIncome = 0;
    let incomeToReview = 0;
    let expensesToReview = 0;
    let trend = 0;

    if (data && data.Rows && data.Rows.Row) {
        // ... (data extraction logic remains same)
        const rows = data.Rows.Row;
        const columns = data.Columns.Column;

        const totalIdx = columns.findIndex((c: any) => c.ColTitle === "Total" || (c.MetaData && c.MetaData.some((m: any) => m.Value === "total")));
        const finalIdx = totalIdx !== -1 ? totalIdx : columns.length - 1;

        const getVal = (row: any, idx: number) => {
            if (!row) return 0;
            const colData = row.Summary?.ColData || row.ColData;
            return colData && colData[idx] ? parseFloat(colData[idx].value || 0) : 0;
        };

        const incomeRow = rows.find((r: any) => r.group === "Income" || (r.Header && r.Header.ColData && r.Header.ColData[0].value === "Income"));
        const cogsRow = rows.find((r: any) => r.group === "COGS" || (r.Header && r.Header.ColData && r.Header.ColData[0].value === "Cost of Goods Sold"));
        const expenseRow = rows.find((r: any) => r.group === "Expense" || r.group === "Expenses" || (r.Header && r.Header.ColData && r.Header.ColData[0].value === "Expenses"));

        if (incomeRow) income = getVal(incomeRow, finalIdx);

        let baseExpenses = 0;
        let cogs = 0;
        if (expenseRow) baseExpenses = getVal(expenseRow, finalIdx);
        if (cogsRow) cogs = getVal(cogsRow, finalIdx);
        expenses = baseExpenses + cogs;

        const actualNetIncomeRow = rows.find((r: any) => r.group === "NetIncome" || r.group === "NetOperatingIncome");
        if (actualNetIncomeRow) {
            netIncome = getVal(actualNetIncomeRow, finalIdx);
        } else {
            netIncome = income - expenses;
        }
    }

    const netIncomePercent = income > 0 ? Math.round((netIncome / income) * 100) : 0;

    return (
        <Card
            className="border-none shadow-sm cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all active:scale-[0.98] relative"
            onClick={() => navigate("/dashboard/detail/profit-loss")}
        >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">PROFIT & LOSS</CardTitle>
                </div>
                {onPeriodChange && (
                    <PeriodSelector currentPeriod={period} onPeriodChange={onPeriodChange} />
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <div className="text-[12px] text-gray-500">Net profit for {PERIODS[period].toLowerCase()}</div>
                    <div className="flex items-center gap-2">
                        <div className="text-3xl font-bold font-sans tracking-tight text-gray-900">${netIncome.toLocaleString()}</div>
                        <div className="bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 text-[11px] font-bold flex items-center gap-1 leading-none h-5">
                            <Info className="w-3 h-3" /> {netIncomePercent}%
                        </div>
                    </div>
                    {trend !== 0 && (
                        <div className={cn("flex items-center gap-1 text-[13px] font-medium", trend > 0 ? "text-[#2ca01c]" : "text-[#c40404]")}>
                            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            <span>{trend > 0 ? 'Up' : 'Down'} {Math.abs(trend)}% from prior period</span>
                        </div>
                    )}
                </div>

                <div className="mt-8 space-y-6">
                    {/* Income Row */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center pr-2">
                            <div className="text-sm font-bold text-gray-900">${income.toLocaleString()}</div>
                            <div className="text-[11px] text-blue-600 font-semibold">{incomeToReview} to review</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-[12px] text-gray-500 w-16">Income</div>
                            <div className="flex-1 h-3 bg-gray-100 rounded-sm overflow-hidden flex">
                                <div className="h-full bg-[#2ca01c]" style={{ width: '75%' }} />
                                <div className="h-full bg-[#2ca01c]/30 w-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(44, 160, 28, 0.2) 5px, rgba(44, 160, 28, 0.2) 10px)' }} />
                            </div>
                        </div>
                    </div>

                    {/* Expenses Row */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center pr-2">
                            <div className="text-sm font-bold text-gray-900">${expenses.toLocaleString()}</div>
                            <div className="text-[11px] text-blue-600 font-semibold">{expensesToReview} to review</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-[12px] text-gray-500 w-16">Expenses</div>
                            <div className="flex-1 h-3 bg-gray-100 rounded-sm overflow-hidden flex">
                                <div className="h-full bg-[#00a1b1]" style={{ width: '40%' }} />
                                <div className="h-full bg-[#00a1b1]/30 w-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0, 161, 177, 0.2) 5px, rgba(0, 161, 177, 0.2) 10px)' }} />
                            </div>
                        </div>
                    </div>
                </div>


            </CardContent>
        </Card>
    );
};
