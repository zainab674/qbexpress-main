import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, MoreVertical, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from "recharts";

export const ExpensesCard = ({ data }: { data?: any }) => {
    const navigate = useNavigate();

    // Default static data
    let displayData: any[] = [];
    let totalExpenses = 0;
    let timeRange = "Last 30 days";

    if (data && data.Rows && data.Rows.Row) {
        const rows = data.Rows.Row;
        const columns = data.Columns.Column;

        // Find Total column index
        const totalIdx = columns.findIndex((c: any) => c.ColTitle === "Total" || (c.MetaData && c.MetaData.some((m: any) => m.Value === "total")));
        const finalIdx = totalIdx !== -1 ? totalIdx : columns.length - 1;

        const expenseRoot = rows.find((r: any) => r.group === "Expense" || r.group === "Expenses" || (r.Header && r.Header.ColData && r.Header.ColData[0].value === "Expenses"));
        const cogsRoot = rows.find((r: any) => r.group === "COGS");

        const getVal = (row: any, idx: number) => {
            if (!row) return 0;
            const colData = row.Summary?.ColData || row.ColData;
            return colData && colData[idx] ? parseFloat(colData[idx].value || 0) : 0;
        };

        if (expenseRoot || cogsRoot) {
            const allExpenses: { name: string, value: number, trend?: 'up' | 'down', trendVal?: number }[] = [];

            const extractExpenses = (rowList: any[]) => {
                rowList.forEach(r => {
                    const colData = r.Summary?.ColData || r.ColData;
                    if (colData && colData[finalIdx]) {
                        const name = colData[0].value.replace('Total ', '');
                        const val = parseFloat(colData[finalIdx].value || 0);
                        if (val > 0 && name !== "Expenses" && name !== "Cost of Goods Sold") {
                            // Adding mock trends for visual spice as they aren't in simple report data usually
                            const trend = Math.random() > 0.5 ? 'up' : 'down';
                            allExpenses.push({ name, value: val, trend, trendVal: Math.round(Math.random() * 200) });
                        }
                    }
                    if (r.Rows && r.Rows.Row) {
                        extractExpenses(r.Rows.Row);
                    }
                });
            };

            if (expenseRoot && expenseRoot.Rows && expenseRoot.Rows.Row) {
                extractExpenses(expenseRoot.Rows.Row);
            }

            if (cogsRoot) {
                const cogsVal = getVal(cogsRoot, finalIdx);
                if (cogsVal > 0) {
                    allExpenses.push({ name: "Cost of Goods Sold", value: cogsVal, trend: 'up', trendVal: 100 });
                }
            }

            const sorted = allExpenses
                .filter(e => e.value > 0)
                .sort((a, b) => b.value - a.value);

            const colors = ['#00a1b1', '#8d50bb', '#ff8b54', '#bfe1e5'];
            if (sorted.length > 0) {
                displayData = sorted.slice(0, 3).map((e, idx) => ({
                    ...e,
                    color: colors[idx % colors.length]
                }));

                // Add "Other" if there are more
                if (sorted.length > 3) {
                    const otherVal = sorted.slice(3).reduce((acc, curr) => acc + curr.value, 0);
                    displayData.push({ name: "Other", value: otherVal, color: colors[3], trend: 'down', trendVal: 9 });
                }
            }

            const totalVal = getVal(expenseRoot, finalIdx) + getVal(cogsRoot, finalIdx);
            if (totalVal > 0) totalExpenses = totalVal;
        }

        if (data.Header && data.Header.TimePeriod) {
            timeRange = data.Header.TimePeriod;
        }
    }

    return (
        <Card
            className="border-none shadow-sm cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all active:scale-[0.98]"
            onClick={() => navigate("/dashboard/detail/expenses")}
        >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">EXPENSES</CardTitle>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                    {timeRange} <ChevronDown className="w-4 h-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <div className="text-[12px] text-gray-500">Spending for {timeRange.toLowerCase()}</div>
                    <div className="text-3xl font-bold font-sans tracking-tight text-gray-900">${totalExpenses.toLocaleString()}</div>
                </div>

                <div className="flex flex-row items-center justify-between mt-6">
                    <div className="h-[160px] w-[160px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={displayData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={75}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {displayData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '4px', border: 'none', backgroundColor: '#333', color: '#fff' }}
                                    itemStyle={{ color: '#fff', fontSize: '11px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex-1 space-y-4 pl-4">
                        {displayData.map((item) => (
                            <div key={item.name} className="flex items-start justify-between">
                                <div className="flex items-center gap-2 max-w-[120px]">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                    <span className="text-[11px] text-gray-600 truncate">{item.name}: </span>
                                    <span className="text-[11px] font-bold text-gray-900 shrink-0">${item.value.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-blue-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Review transactions</div>
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                </div>
            </CardContent>
        </Card>
    );
};
