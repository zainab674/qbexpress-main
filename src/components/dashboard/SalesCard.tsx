import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";


export const SalesCard = ({ data }: { data?: any }) => {
    const navigate = useNavigate();

    // Default static data
    let chartData: any[] = [];
    let latestTotal = 0;
    let timeRange = "This year to date";

    if (data && data.Columns && data.Columns.Column) {
        const columns = data.Columns.Column;
        const rows = data.Rows.Row;

        // Find Total column index
        const totalIdx = columns.findIndex((c: any) => c.ColTitle === "Total" || (c.MetaData && c.MetaData.some((m: any) => m.Value === "total")));
        const finalIdx = totalIdx !== -1 ? totalIdx : columns.length - 1;

        const incomeRow = rows.find((r: any) => r.group === "Income" || (r.Header && r.Header.ColData && r.Header.ColData[0].value === "Income"));

        if (incomeRow) {
            const rowData = incomeRow.ColData || (incomeRow.Summary && incomeRow.Summary.ColData);
            if (rowData) {
                // Only take month columns (skip Column 0 and skip Total column)
                chartData = columns
                    .map((col: any, idx: number) => ({
                        idx,
                        name: col.ColTitle.split(' ')[0],
                        type: col.ColType
                    }))
                    .filter((c: any, i: number) => i > 0 && i < finalIdx)
                    .map((c: any) => ({
                        name: c.name,
                        Amount: rowData[c.idx] ? parseFloat(rowData[c.idx].value || 0) : 0
                    }));

                latestTotal = rowData[finalIdx] ? parseFloat(rowData[finalIdx].value || 0) : 0;
            }
        }

        if (data.Header && data.Header.TimePeriod) {
            // timeRange = data.Header.TimePeriod;
        }
    }

    return (
        <Card
            className="border-none shadow-sm cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all active:scale-[0.98] relative group"
            onClick={() => navigate("/dashboard/detail/sales")}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[12px] font-bold text-gray-700 uppercase tracking-wide">SALES</CardTitle>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                    {timeRange} <ChevronDown className="w-4 h-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="text-[12px] text-gray-500 mb-1">Total Amount</div>
                    <div className="text-4xl font-bold font-sans tracking-tight text-gray-900">${latestTotal.toLocaleString()}</div>
                </div>

                <div className="h-[200px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 11 }}
                                padding={{ left: 10, right: 10 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 11 }}
                                tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}K`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                align="right"
                                iconType="rect"
                                iconSize={12}
                                wrapperStyle={{ fontSize: '11px', color: '#6B7280', paddingTop: '20px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Amount"
                                stroke="#2ca01c"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#2ca01c', stroke: '#2ca01c', strokeWidth: 1 }}
                                activeDot={{ r: 6, fill: '#2ca01c' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="absolute bottom-4 right-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-5 h-5" />
                </div>
            </CardContent>
        </Card>
    );
};

