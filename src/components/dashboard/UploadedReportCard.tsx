import { Card, CardContent } from "@/components/ui/card";
import { FileBarChart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Report {
    _id: string;
    fileName: string;
    uploadedAt: string;
    data: any;
}

interface UploadedReportCardProps {
    report: Report;
    onClick: () => void;
}

const colors = ["#2ca01c", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#6366f1"];

export const UploadedReportCard = ({ report, onClick }: UploadedReportCardProps) => {
    const { summaryValue, chartData, isPositive, lineKeys } = useMemo(() => {
        let summaryValue: number | null = null;
        let chartData: any[] = [];
        let isPositive = true;
        let lineKeys: string[] = [];

        if (!report?.data) return { summaryValue, chartData, isPositive, lineKeys };

        const sheets = Object.keys(report.data);
        if (sheets.length === 0) return { summaryValue, chartData, isPositive, lineKeys };

        const sheetData = report.data[sheets[0]];
        if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return { summaryValue, chartData, isPositive, lineKeys };

        const isFin = sheetData.some(r =>
            r && typeof r[0] === "string" &&
            r.length >= 2 &&
            r.slice(1).some(v => typeof v === "number" || (typeof v === 'string' && !isNaN(Number(v.replace(/[$,()]/g, '').trim())) && v.replace(/[$,()]/g, '').trim() !== ''))
        );

        if (isFin) {
            const rowsWithNumbers = sheetData.filter(r => r && r.length > 1 && r.slice(1).some(v => typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v.replace(/[$,()]/g, '').trim())) && v.replace(/[$,()]/g, '').trim() !== '')));

            if (rowsWithNumbers.length > 0) {
                const numericCols: number[] = [];
                const firstDataRow = rowsWithNumbers[0];
                for (let i = 1; i < firstDataRow.length; i++) {
                    const hasNumbersInCol = rowsWithNumbers.some(row => {
                        const v = row[i];
                        if (typeof v === 'number') return true;
                        if (typeof v === 'string') {
                            const cleaned = v.replace(/[$,()]/g, '').trim();
                            return !isNaN(Number(cleaned)) && cleaned !== '';
                        }
                        return false;
                    });
                    if (hasNumbersInCol) numericCols.push(i);
                }

                if (numericCols.length === 1) {
                    const colIdx = numericCols[0];
                    rowsWithNumbers.forEach((row, rowIdx) => {
                        const itemName = row[0] ? String(row[0]).trim() : `Item ${rowIdx}`;
                        const val = row[colIdx];
                        let numVal = val;
                        if (typeof val === 'string') {
                            const cleaned = val.replace(/[$,()]/g, '').trim();
                            if (cleaned !== '' && !isNaN(Number(cleaned))) {
                                numVal = Number(cleaned) * (val.includes('(') ? -1 : 1);
                            } else {
                                numVal = null;
                            }
                        }
                        if (typeof numVal === 'number' && !isNaN(numVal)) {
                            chartData.push({ name: itemName, value: numVal });
                        }
                    });
                    if (chartData.length > 0) lineKeys.push("value");
                } else if (numericCols.length > 1) {
                    const headerRow = sheetData.find((r: any) => r && r.slice(1).some((v: any) => typeof v === 'string' && v.length > 1));

                    numericCols.forEach((colIdx, idx) => {
                        const name = headerRow && headerRow[colIdx] ? String(headerRow[colIdx]).trim() : `P${idx + 1}`;
                        chartData.push({ periodIndex: idx, name });
                    });

                    rowsWithNumbers.forEach((row, rowIdx) => {
                        const itemName = row[0] ? String(row[0]).trim() : `Item ${rowIdx}`;
                        if (!lineKeys.includes(itemName)) lineKeys.push(itemName);

                        numericCols.forEach((colIdx, chartIdx) => {
                            const val = row[colIdx];
                            let numVal = val;
                            if (typeof val === 'string') {
                                const cleaned = val.replace(/[$,()]/g, '').trim();
                                if (cleaned !== '' && !isNaN(Number(cleaned))) {
                                    numVal = Number(cleaned) * (val.includes('(') ? -1 : 1);
                                } else {
                                    numVal = null;
                                }
                            }
                            if (typeof numVal === 'number' && !isNaN(numVal) && chartData[chartIdx]) {
                                chartData[chartIdx][itemName] = numVal;
                            }
                        });
                    });
                }

                let targetRow = rowsWithNumbers.find(r => r[0] && (String(r[0]).toLowerCase().includes('total') || String(r[0]).toLowerCase().includes('net')));
                if (!targetRow) targetRow = rowsWithNumbers[0];

                const targetValues = targetRow.slice(1).map(v => {
                    if (typeof v === 'number') return v;
                    if (typeof v === 'string') {
                        const cleaned = v.replace(/[$,()]/g, '').trim();
                        if (!isNaN(Number(cleaned)) && cleaned !== '') return Number(cleaned) * (v.includes('(') ? -1 : 1);
                    }
                    return null;
                }).filter(v => v !== null) as number[];

                if (targetValues.length > 0) {
                    summaryValue = targetValues[targetValues.length - 1];
                    if (targetValues.length > 1) {
                        isPositive = targetValues[targetValues.length - 1] >= targetValues[targetValues.length - 2];
                    } else {
                        isPositive = targetValues[0] >= 0;
                    }
                }
            }
        } else {
            let headerRowIndex = -1;
            for (let i = 0; i < Math.min(sheetData.length, 20); i++) {
                const row = sheetData[i];
                if (!row) continue;
                const nonEmptyStrCount = row.filter((cell: any) => typeof cell === "string" && cell.trim() !== "").length;
                if (nonEmptyStrCount >= 2) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex !== -1 && headerRowIndex + 1 < sheetData.length) {
                const headers = sheetData[headerRowIndex].map((h: any) => h ? String(h).trim() : '');
                const sampleRow = sheetData[headerRowIndex + 1];
                const numericColIndices: number[] = [];
                for (let c = 0; c < sampleRow.length; c++) {
                    const val = sampleRow[c];
                    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val.replace(/[$,]/g, ''))) && val.trim() !== '')) {
                        numericColIndices.push(c);
                    }
                }

                if (numericColIndices.length === 1) {
                    let sum = 0;
                    const valColIdx = numericColIndices[0];
                    let labelColIdx = 0;
                    for (let c = valColIdx - 1; c >= 0; c--) {
                        if (typeof sampleRow[c] === 'string') {
                            labelColIdx = c;
                            break;
                        }
                    }

                    for (let i = headerRowIndex + 1; i < sheetData.length; i++) {
                        const row = sheetData[i];
                        if (!row || row.length <= valColIdx) continue;
                        let val = row[valColIdx];
                        if (typeof val === 'string') {
                            const cleaned = val.replace(/[$,()]/g, '').trim();
                            if (cleaned === '') continue;
                            if (!isNaN(Number(cleaned))) {
                                val = Number(cleaned) * (val.includes('(') ? -1 : 1);
                            }
                        }
                        if (typeof val === 'number') {
                            sum += val;
                            const label = row[labelColIdx] ? String(row[labelColIdx]).trim() : `Item ${i}`;
                            chartData.push({ name: label, value: val });
                        }
                    }
                    if (chartData.length > 0) {
                        summaryValue = sum;
                        isPositive = sum >= 0;
                        lineKeys.push("value");
                    }
                } else if (numericColIndices.length > 1) {
                    let sums: number[] = new Array(numericColIndices.length).fill(0);
                    for (let i = headerRowIndex + 1; i < sheetData.length; i++) {
                        const row = sheetData[i];
                        if (!row) continue;
                        const dataPoint: any = { rowIndex: i };
                        let hasData = false;
                        numericColIndices.forEach((colIdx, idx) => {
                            if (row.length <= colIdx) return;
                            let val = row[colIdx];
                            if (typeof val === 'string') {
                                const cleaned = val.replace(/[$,()]/g, '').trim();
                                if (!isNaN(Number(cleaned)) && cleaned !== '') {
                                    val = Number(cleaned) * (val.includes('(') ? -1 : 1);
                                }
                            }
                            if (typeof val === 'number') {
                                const key = headers[colIdx] || `Col ${colIdx}`;
                                dataPoint[key] = val;
                                sums[idx] += val;
                                hasData = true;
                                if (!lineKeys.includes(key)) lineKeys.push(key);
                            } else if (typeof val === 'string' && colIdx === 0) {
                                dataPoint['name'] = val;
                            }
                        });
                        if (hasData) chartData.push(dataPoint);
                    }
                    if (chartData.length > 0) {
                        summaryValue = sums[0];
                        isPositive = sums[0] >= 0;
                    }
                }
            }
        }

        lineKeys = lineKeys.slice(0, 3);
        return { summaryValue, chartData, isPositive, lineKeys };
    }, [report]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: "compact",
            maximumFractionDigits: 1
        }).format(value);
    };

    return (
        <Card
            className="h-[380px] cursor-pointer hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden relative group flex flex-col bg-white"
            onClick={onClick}
        >
            <CardContent className="flex-1 p-5 flex flex-col relative z-10 pointer-events-none">
                <div className="flex justify-between items-start pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-sm border border-primary/10">
                            <FileBarChart className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[14px] text-slate-900 line-clamp-1 group-hover:text-primary transition-colors leading-tight">
                                {report.fileName}
                            </h3>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold opacity-70">
                                {report.uploadedAt ? formatDistanceToNow(new Date(report.uploadedAt)) + ' ago' : 'Recently uploaded'}
                            </p>
                        </div>
                    </div>

                </div>

                <div className="mt-8 flex-1 pointer-events-auto w-full min-h-0">
                    {chartData.length > 0 && lineKeys.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    {lineKeys.map((key, index) => {
                                        const color = lineKeys.length === 1 ? (isPositive ? "#2ca01c" : "#dc2626") : colors[index % colors.length];
                                        return (
                                            <linearGradient key={`gradient-${key}`} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                                                <stop offset="100%" stopColor={color} stopOpacity={0} />
                                            </linearGradient>
                                        );
                                    })}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                    tickFormatter={(val) => val === 0 ? "0" : formatCurrency(val)}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        padding: '12px'
                                    }}
                                    formatter={(value: any) => [`${formatCurrency(value)}`, "Amount"]}
                                />
                                {lineKeys.map((key, index) => {
                                    const color = lineKeys.length === 1 ? (isPositive ? "#2ca01c" : "#dc2626") : colors[index % colors.length];
                                    return (
                                        <Area
                                            key={key}
                                            type="monotone"
                                            dataKey={key}
                                            stroke={color}
                                            strokeWidth={3}
                                            fill={`url(#gradient-${key})`}
                                            dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: color }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                            isAnimationActive={false}
                                        />
                                    );
                                })}
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-[0.1]">
                            <FileBarChart className="w-24 h-24" />
                            <p className="text-xs font-bold mt-2 uppercase tracking-widest text-slate-900">No Chart Data</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
