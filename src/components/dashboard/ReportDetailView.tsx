import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileBarChart } from "lucide-react";

interface Report {
    _id: string;
    fileName: string;
    uploadedAt: string;
    data: any;
}

export const ReportDetailView = ({ report }: { report: Report }) => {
    const [data, setData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [chartType, setChartType] = useState<"line" | "bar">("line");
    const [activeSheet, setActiveSheet] = useState<string>("");
    const [isFinancial, setIsFinancial] = useState(false);
    const [selectedItem, setSelectedItem] = useState("");
    const [financialItems, setFinancialItems] = useState<string[]>([]);

    useEffect(() => {
        if (report?.data) {
            const firstSheet = Object.keys(report.data)[0];
            setActiveSheet(firstSheet);
            processSheetData(report.data[firstSheet]);
        }
    }, [report]);

    const handleSheetChange = (sheetName: string) => {
        setActiveSheet(sheetName);
        processSheetData(report.data[sheetName]);
    };

    const processSheetData = (rawData: any[][]) => {
        if (!rawData || rawData.length === 0) return;

        const isFin = rawData.some(r =>
            r && typeof r[0] === "string" &&
            r.length >= 2 &&
            r.slice(1).some(v => typeof v === "number")
        );
        setIsFinancial(isFin);

        if (isFin) {
            const rows = rawData.filter(r => r && r.length > 0 && (r[0] || r.some(v => typeof v === 'number')));
            let headerIdx = 0;
            for (let i = 0; i < Math.min(rows.length, 5); i++) {
                if (rows[i].slice(1).some(v => v !== null && v !== undefined)) {
                    headerIdx = i;
                    break;
                }
            }

            const headerRow = rows[headerIdx];
            const periods = headerRow.slice(1).map((p, i) => p ? String(p).trim() : `Period ${i + 1}`);

            const processedFinData: any[] = [];
            const items: string[] = [];

            for (let i = headerIdx + 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length === 0) continue;

                const label = row[0] ? String(row[0]).trim() : "";
                const values = row.slice(1);
                let hasNumbers = false;

                values.forEach((val, idx) => {
                    let numVal = val;
                    if (typeof val === 'string') {
                        const cleaned = val.replace(/[$,()]/g, '').trim();
                        if (!isNaN(Number(cleaned)) && cleaned !== '') {
                            numVal = Number(cleaned) * (val.includes('(') ? -1 : 1);
                        }
                    }

                    if (typeof numVal === 'number') {
                        hasNumbers = true;
                        processedFinData.push({
                            item: label,
                            period: periods[idx],
                            value: numVal
                        });
                    }
                });

                if (hasNumbers && !items.includes(label)) {
                    items.push(label);
                }
            }

            setFinancialItems(items);
            if (items.length > 0) setSelectedItem(items[0]);
            setData(processedFinData);
            setHeaders(["Item", "Period", "Value"]);
        } else {
            let headerRowIndex = -1;
            for (let i = 0; i < Math.min(rawData.length, 20); i++) {
                const row = rawData[i];
                if (!row) continue;
                const nonEmptyStrCount = row.filter((cell) => typeof cell === "string" && cell.trim() !== "").length;
                if (nonEmptyStrCount >= 2) {
                    headerRowIndex = i;
                    break;
                }
            }

            if (headerRowIndex === -1) headerRowIndex = rawData.findIndex((row) => row && row.length > 0);
            if (headerRowIndex === -1) return;

            const parsedHeaders = rawData[headerRowIndex].map(h => String(h).trim());
            setHeaders(parsedHeaders);

            const parsedData = [];
            for (let i = headerRowIndex + 1; i < rawData.length; i++) {
                const row = rawData[i];
                if (!row || row.length === 0) continue;

                const obj: any = {};
                parsedHeaders.forEach((header, index) => {
                    let value = row[index];
                    if (value !== undefined && value !== null) {
                        if (typeof value === 'string' && !isNaN(Number(value.replace(/[$,]/g, ''))) && value.trim() !== '') {
                            value = Number(value.replace(/[$,]/g, ''));
                        }
                    } else {
                        value = "";
                    }
                    obj[header] = value;
                });

                const numericValues = Object.values(obj).filter(v => typeof v === 'number').length;
                if (numericValues > 0) parsedData.push(obj);
            }
            setData(parsedData);
        }
    };

    const getNumericKeys = () => {
        if (data.length === 0) return [];
        const sampleRow = data[0];
        return headers.filter((header) => typeof sampleRow[header] === "number");
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-wrap gap-4">
                    {Object.keys(report.data).length > 1 && (
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Sheet</label>
                            <select
                                value={activeSheet}
                                onChange={(e) => handleSheetChange(e.target.value)}
                                className="h-8 rounded border border-gray-200 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                {Object.keys(report.data).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}
                    {isFinancial && financialItems.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Line Item</label>
                            <select
                                value={selectedItem}
                                onChange={(e) => setSelectedItem(e.target.value)}
                                className="h-8 rounded border border-gray-200 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary max-w-[200px]"
                            >
                                {financialItems.map(item => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant={chartType === "line" ? "default" : "outline"} size="sm" onClick={() => setChartType("line")}>Line</Button>
                    <Button variant={chartType === "bar" ? "default" : "outline"} size="sm" onClick={() => setChartType("bar")}>Bar</Button>
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <FileBarChart className="w-4 h-4 text-primary" />
                        {report.fileName} - Visual Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === "line" ? (
                            <LineChart data={isFinancial ? data.filter(d => d.item === selectedItem) : data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey={isFinancial ? "period" : headers[0]} tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                                {isFinancial ? (
                                    <Line type="monotone" dataKey="value" name={selectedItem} stroke="#2ca01c" strokeWidth={2} dot={{ r: 4 }} />
                                ) : (
                                    getNumericKeys().map((key, index) => (
                                        <Line key={key} type="monotone" dataKey={key} stroke={`hsl(${index * 60 + 160}, 70%, 45%)`} strokeWidth={2} />
                                    ))
                                )}
                            </LineChart>
                        ) : (
                            <BarChart data={isFinancial ? data.filter(d => d.item === selectedItem) : data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey={isFinancial ? "period" : headers[0]} tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                                {isFinancial ? (
                                    <Bar dataKey="value" name={selectedItem} fill="#2ca01c" radius={[4, 4, 0, 0]} />
                                ) : (
                                    getNumericKeys().map((key, index) => (
                                        <Bar key={key} dataKey={key} fill={`hsl(${index * 60 + 160}, 70%, 45%)`} radius={[4, 4, 0, 0]} />
                                    ))
                                )}
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b pb-3">
                    <CardTitle className="text-sm font-bold">Data Preview</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    {headers.map((header) => (
                                        <th key={header} className="px-4 py-3 font-bold text-gray-500 whitespace-nowrap uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(isFinancial ? data.filter(d => d.item === selectedItem) : data).slice(0, 10).map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        {headers.map((header) => (
                                            <td key={`${i}-${header}`} className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                {typeof row[header] === 'number' ? row[header].toLocaleString(undefined, { minimumFractionDigits: 2 }) : row[header]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
